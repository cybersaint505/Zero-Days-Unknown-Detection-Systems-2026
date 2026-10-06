"""
Phase 1: Exploratory Data Analysis (EDA)
Generates:
1. Class distribution plot
2. Missing values and feature summaries
3. Correlation heatmap of key flow metrics
4. Saved artifacts in /reports/eda/
"""

import os
import json
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")
REPORT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "eda")

def run_eda():
    os.makedirs(REPORT_DIR, exist_ok=True)
    train_path = os.path.join(DATA_DIR, "nsl_kdd_train.csv")
    test_path = os.path.join(DATA_DIR, "nsl_kdd_test.csv")

    if not os.path.exists(train_path):
        raise FileNotFoundError(f"Missing {train_path}. Run download_data.py first.")

    print("[*] Loading datasets for EDA...")
    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)

    # 1. Summary Statistics & Missing Values
    missing_train = df_train.isnull().sum().to_dict()
    missing_total = sum(missing_train.values())
    
    numeric_cols = df_train.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df_train.select_dtypes(include=['object']).columns.tolist()
    
    summary_stats = {
        "train_rows": len(df_train),
        "test_rows": len(df_test),
        "features_total": len(df_train.columns),
        "numeric_features_count": len(numeric_cols),
        "categorical_features": [c for c in categorical_cols if c not in ["attack_type", "attack_class"]],
        "missing_values_count": missing_total,
        "train_class_distribution": df_train["attack_class"].value_counts().to_dict(),
        "test_class_distribution": df_test["attack_class"].value_counts().to_dict(),
        "train_binary_distribution": {
            "benign": int((df_train["is_attack"] == 0).sum()),
            "attack": int((df_train["is_attack"] == 1).sum())
        }
    }

    with open(os.path.join(REPORT_DIR, "eda_summary.json"), "w") as f:
        json.dump(summary_stats, f, indent=2)
    print(f"[+] Saved {os.path.join(REPORT_DIR, 'eda_summary.json')}")

    # 2. Plot: Class Distribution (Train vs Test)
    plt.figure(figsize=(10, 5), dpi=150)
    plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
    
    df_plot = pd.DataFrame({
        "Train": df_train["attack_class"].value_counts(),
        "Test": df_test["attack_class"].value_counts()
    }).fillna(0)
    
    colors = ["#2563eb", "#dc2626"]
    ax = df_plot.plot(kind="bar", figsize=(10, 5), color=colors, width=0.7, edgecolor='black', linewidth=0.5)
    plt.title("NSL-KDD Attack Class Distribution (Train vs Test)", fontsize=13, fontweight='bold', pad=12)
    plt.xlabel("Category", fontsize=11)
    plt.ylabel("Flow Count", fontsize=11)
    plt.xticks(rotation=0)
    plt.legend(frameon=True)
    plt.tight_layout()
    plot_dist_path = os.path.join(REPORT_DIR, "class_distribution.png")
    plt.savefig(plot_dist_path)
    plt.close()
    print(f"[+] Saved {plot_dist_path}")

    # 3. Plot: Correlation Heatmap for continuous traffic features
    key_features = [
        "duration", "src_bytes", "dst_bytes", "wrong_fragment", "hot",
        "num_failed_logins", "logged_in", "num_compromised", "count",
        "srv_count", "serror_rate", "srv_serror_rate", "same_srv_rate",
        "diff_srv_rate", "dst_host_count", "dst_host_srv_count",
        "dst_host_same_srv_rate", "dst_host_diff_srv_rate", "is_attack"
    ]
    corr_df = df_train[[f for f in key_features if f in df_train.columns]].corr()
    
    plt.figure(figsize=(12, 10), dpi=150)
    sns.heatmap(corr_df, annot=True, fmt=".2f", cmap="coolwarm", cbar=True,
                linewidths=0.5, linecolor='#e2e8f0', annot_kws={"size": 7})
    plt.title("Traffic Feature Correlation Heatmap with Attack Indicator", fontsize=13, fontweight='bold', pad=15)
    plt.xticks(rotation=45, ha='right', fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.tight_layout()
    corr_path = os.path.join(REPORT_DIR, "correlation_heatmap.png")
    plt.savefig(corr_path)
    plt.close()
    print(f"[+] Saved {corr_path}")

    # 4. Feature summary distributions (log scale bytes & counts)
    fig, axes = plt.subplots(2, 2, figsize=(12, 8), dpi=150)
    for ax, feat, title in zip(
        axes.flatten(),
        ["src_bytes", "dst_bytes", "count", "serror_rate"],
        ["Source Bytes (log1p)", "Dest Bytes (log1p)", "Flow Count (same srv)", "Syn Error Rate"]
    ):
        if feat in ["src_bytes", "dst_bytes"]:
            sns.histplot(np.log1p(df_train[feat]), bins=30, kde=True, ax=ax, color="#0284c7")
        else:
            sns.histplot(df_train[feat], bins=30, kde=True, ax=ax, color="#0d9488")
        ax.set_title(title, fontsize=11, fontweight='bold')
        ax.set_ylabel("Frequency")
    plt.tight_layout()
    feat_dist_path = os.path.join(REPORT_DIR, "feature_distributions.png")
    plt.savefig(feat_dist_path)
    plt.close()
    print(f"[+] Saved {feat_dist_path}")

    print("\n[✓] Phase 1 EDA Complete! Reports saved in reports/eda/")
    return summary_stats

if __name__ == "__main__":
    run_eda()
