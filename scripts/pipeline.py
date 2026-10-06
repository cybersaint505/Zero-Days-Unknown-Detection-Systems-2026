"""
Phase 1: Preprocessing & Data Splitting Pipeline
Features:
- Scikit-learn Pipeline with ColumnTransformer (OneHotEncoder for categorical, RobustScaler for numeric)
- Missing/Inf value handling
- Supervised Stratified Split (Train, Val, Test)
- Leave-One-Attack-Out Split for Zero-Day Simulation (holds out 'r2l' category)
- Benign-only subsets for unsupervised anomaly training
- Artifact exports (.parquet, .joblib, .json)
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split

DATA_RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")
DATA_PROC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed")
ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")

CATEGORICAL_FEATURES = ["protocol_type", "service", "flag"]

LABEL_MAPPING = {
    "normal": 0,
    "dos": 1,
    "probe": 2,
    "r2l": 3,
    "u2r": 4
}
INV_LABEL_MAPPING = {v: k for k, v in LABEL_MAPPING.items()}

def build_pipeline(numeric_cols, categorical_cols):
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', RobustScaler(quantile_range=(5.0, 95.0), with_centering=True, with_scaling=True))
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, categorical_cols)
        ],
        remainder='drop',
        verbose_feature_names_out=False
    )
    return preprocessor

def run_pipeline():
    os.makedirs(DATA_PROC_DIR, exist_ok=True)
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    train_path = os.path.join(DATA_RAW_DIR, "nsl_kdd_train.csv")
    test_path = os.path.join(DATA_RAW_DIR, "nsl_kdd_test.csv")

    print("[*] Loading raw CSV datasets...")
    df_train_raw = pd.read_csv(train_path)
    df_test_raw = pd.read_csv(test_path)

    # Clean inf / -inf
    df_train_raw.replace([np.inf, -np.inf], np.nan, inplace=True)
    df_test_raw.replace([np.inf, -np.inf], np.nan, inplace=True)

    # Determine numeric feature columns
    exclude_cols = ["attack_type", "attack_class", "difficulty_level", "is_attack"] + CATEGORICAL_FEATURES
    numeric_cols = [c for c in df_train_raw.columns if c not in exclude_cols and pd.api.types.is_numeric_dtype(df_train_raw[c])]

    print(f"[*] Features identified: {len(numeric_cols)} numeric, {len(CATEGORICAL_FEATURES)} categorical")

    # Map attack labels to integer codes
    df_train_raw["label_idx"] = df_train_raw["attack_class"].map(LABEL_MAPPING).fillna(0).astype(int)
    df_test_raw["label_idx"] = df_test_raw["attack_class"].map(LABEL_MAPPING).fillna(0).astype(int)

    # Fit preprocessor on training data features ONLY
    print("[*] Fitting ColumnTransformer pipeline on training data...")
    preprocessor = build_pipeline(numeric_cols, CATEGORICAL_FEATURES)
    X_train_raw = df_train_raw[numeric_cols + CATEGORICAL_FEATURES]
    preprocessor.fit(X_train_raw)

    # Get transformed feature column names
    try:
        feature_names = list(preprocessor.get_feature_names_out())
    except Exception:
        cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
        cat_features = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
        feature_names = numeric_cols + cat_features

    print(f"[+] Total transformed features: {len(feature_names)}")

    # Save Preprocessor Artifact
    preproc_path = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")
    joblib.dump(preprocessor, preproc_path)
    print(f"[+] Saved preprocessing pipeline -> {preproc_path}")

    # Helper function to transform dataframe to structured dataframe with metadata
    def transform_df(df_source):
        X_mat = preprocessor.transform(df_source[numeric_cols + CATEGORICAL_FEATURES])
        df_out = pd.DataFrame(X_mat, columns=feature_names, index=df_source.index)
        df_out["attack_class"] = df_source["attack_class"].values
        df_out["label_idx"] = df_source["label_idx"].values
        df_out["is_attack"] = df_source["is_attack"].values
        return df_out

    print("[*] Transforming train and test datasets...")
    df_train_trans = transform_df(df_train_raw)
    df_test_trans = transform_df(df_test_raw)

    # -------------------------------------------------------------
    # 1. Supervised Split: Stratified train / validation / test
    # -------------------------------------------------------------
    print("[*] Constructing Stratified Supervised Split (Train / Val / Test)...")
    # Stratified split on label_idx
    train_sup, val_sup = train_test_split(
        df_train_trans,
        test_size=0.20,
        random_state=42,
        stratify=df_train_trans["label_idx"]
    )
    test_sup = df_test_trans.copy()

    # Save parquet files
    train_sup.to_parquet(os.path.join(DATA_PROC_DIR, "train_supervised.parquet"), index=False)
    val_sup.to_parquet(os.path.join(DATA_PROC_DIR, "val_supervised.parquet"), index=False)
    test_sup.to_parquet(os.path.join(DATA_PROC_DIR, "test_supervised.parquet"), index=False)
    print(f"[+] Saved supervised parquets: train={len(train_sup)}, val={len(val_sup)}, test={len(test_sup)}")

    # -------------------------------------------------------------
    # 2. Leave-One-Attack-Out Split (Zero-Day Holdout Simulation)
    # -------------------------------------------------------------
    # Hold out entire 'r2l' category (remote to local attacks) from training
    ZERO_DAY_HOLDOUT = "r2l"
    print(f"[*] Constructing Leave-One-Attack-Out split (Holdout category: '{ZERO_DAY_HOLDOUT}')...")
    
    train_zero_exp = train_sup[train_sup["attack_class"] != ZERO_DAY_HOLDOUT].copy()
    val_zero_exp = val_sup[val_sup["attack_class"] != ZERO_DAY_HOLDOUT].copy()
    # Test zero day set has the unseen attack
    test_zero_day_only = test_sup[test_sup["attack_class"] == ZERO_DAY_HOLDOUT].copy()
    # Mixed test set containing benign + unseen zero-day attacks for evaluation
    test_zero_day_eval = test_sup[test_sup["attack_class"].isin(["normal", ZERO_DAY_HOLDOUT])].copy()

    train_zero_exp.to_parquet(os.path.join(DATA_PROC_DIR, "train_zero_day_exp.parquet"), index=False)
    val_zero_exp.to_parquet(os.path.join(DATA_PROC_DIR, "val_zero_day_exp.parquet"), index=False)
    test_zero_day_only.to_parquet(os.path.join(DATA_PROC_DIR, "test_zero_day_only.parquet"), index=False)
    test_zero_day_eval.to_parquet(os.path.join(DATA_PROC_DIR, "test_zero_day_eval.parquet"), index=False)
    print(f"[+] Saved zero-day experiment splits: held-out count in test={len(test_zero_day_only)}")

    # -------------------------------------------------------------
    # 3. Benign-Only Subsets for Unsupervised Anomaly Detection
    # -------------------------------------------------------------
    print("[*] Creating benign-only datasets for unsupervised anomaly training...")
    train_benign = train_sup[train_sup["attack_class"] == "normal"].copy()
    val_benign = val_sup[val_sup["attack_class"] == "normal"].copy()

    train_benign.to_parquet(os.path.join(DATA_PROC_DIR, "train_benign.parquet"), index=False)
    val_benign.to_parquet(os.path.join(DATA_PROC_DIR, "val_benign.parquet"), index=False)
    print(f"[+] Saved benign datasets: train_benign={len(train_benign)}, val_benign={len(val_benign)}")

    # Save feature manifest
    features_manifest = {
        "numeric_features": numeric_cols,
        "categorical_features": CATEGORICAL_FEATURES,
        "encoded_feature_names": feature_names,
        "num_features": len(feature_names),
        "label_mapping": LABEL_MAPPING,
        "zero_day_holdout_class": ZERO_DAY_HOLDOUT,
        "splits": {
            "train_supervised": len(train_sup),
            "val_supervised": len(val_sup),
            "test_supervised": len(test_sup),
            "train_benign": len(train_benign),
            "val_benign": len(val_benign),
            "test_zero_day_holdout": len(test_zero_day_only)
        }
    }
    with open(os.path.join(ARTIFACTS_DIR, "features.json"), "w") as f:
        json.dump(features_manifest, f, indent=2)
    print(f"[+] Saved features manifest -> {os.path.join(ARTIFACTS_DIR, 'features.json')}")
    print("[✓] Phase 1 Data Pipeline Complete!")

if __name__ == "__main__":
    run_pipeline()
