"""
Phase 1: Dataset Acquisition for NIDS
Dataset: NSL-KDD (refined benchmark for intrusion detection)
Downloads raw NSL-KDD datasets and stores with standardized column headers.
"""

import os
import sys
import urllib.request
import pandas as pd

DATA_RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")

COLUMNS = [
    "duration", "protocol_type", "service", "flag", "src_bytes",
    "dst_bytes", "land", "wrong_fragment", "urgent", "hot",
    "num_failed_logins", "logged_in", "num_compromised", "root_shell",
    "su_attempted", "num_root", "num_file_creations", "num_shells",
    "num_access_files", "num_outbound_cmds", "is_host_login",
    "is_guest_login", "count", "srv_count", "serror_rate",
    "srv_serror_rate", "rerror_rate", "srv_rerror_rate", "same_srv_rate",
    "diff_srv_rate", "srv_diff_host_rate", "dst_host_count",
    "dst_host_srv_count", "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate", "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate", "dst_host_serror_rate",
    "dst_host_srv_serror_rate", "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate", "attack_type", "difficulty_level"
]

ATTACK_MAP = {
    'normal': 'normal',
    # DoS
    'neptune': 'dos', 'smurf': 'dos', 'back': 'dos', 'teardrop': 'dos',
    'pod': 'dos', 'land': 'dos', 'apache2': 'dos', 'mailbomb': 'dos',
    'processtable': 'dos', 'udpstorm': 'dos',
    # Probe
    'satan': 'probe', 'ipsweep': 'probe', 'portsweep': 'probe',
    'nmap': 'probe', 'mscan': 'probe', 'saint': 'probe',
    # R2L
    'warezclient': 'r2l', 'guess_passwd': 'r2l', 'warezmaster': 'r2l',
    'imap': 'r2l', 'ftp_write': 'r2l', 'multihop': 'r2l', 'phf': 'r2l',
    'spy': 'r2l', 'sendmail': 'r2l', 'named': 'r2l', 'snmpgetattack': 'r2l',
    'snmpguess': 'r2l', 'worm': 'r2l', 'xlock': 'r2l', 'xsnoop': 'r2l',
    'httptunnel': 'r2l',
    # U2R
    'buffer_overflow': 'u2r', 'rootkit': 'u2r', 'loadmodule': 'u2r',
    'perl': 'u2r', 'sqlattack': 'u2r', 'xterm': 'u2r', 'ps': 'u2r'
}

URLS = {
    # We download KDDTrain+_20Percent for fast agile iteration and complete KDDTrain+ when needed
    "train_20": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain+_20Percent.txt",
    "train_full": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain+.txt",
    "test": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTest+.txt"
}

def download_file(url: str, dest_path: str):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        print(f"[+] Found cached {os.path.basename(dest_path)} ({os.path.getsize(dest_path)} bytes)")
        return dest_path
    print(f"[*] Downloading {url} -> {dest_path}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(dest_path, 'wb') as out_f:
        out_f.write(resp.read())
    print(f"[+] Downloaded {os.path.basename(dest_path)} ({os.path.getsize(dest_path)} bytes)")
    return dest_path

def main():
    os.makedirs(DATA_RAW_DIR, exist_ok=True)
    raw_train_txt = os.path.join(DATA_RAW_DIR, "KDDTrain+.txt")
    raw_test_txt = os.path.join(DATA_RAW_DIR, "KDDTest+.txt")
    
    # Download 20% train for speed or full train
    try:
        download_file(URLS["train_20"], raw_train_txt)
        download_file(URLS["test"], raw_test_txt)
    except Exception as e:
        print(f"[!] Error downloading: {e}. Retrying with backup...")
        download_file(URLS["train_full"], raw_train_txt)
        download_file(URLS["test"], raw_test_txt)

    print("[*] Parsing and adding standardized headers...")
    df_train = pd.read_csv(raw_train_txt, names=COLUMNS, header=None)
    df_test = pd.read_csv(raw_test_txt, names=COLUMNS, header=None)

    # Standardize attack category
    df_train["attack_class"] = df_train["attack_type"].map(lambda x: ATTACK_MAP.get(str(x).lower(), "other"))
    df_test["attack_class"] = df_test["attack_type"].map(lambda x: ATTACK_MAP.get(str(x).lower(), "other"))
    
    # Binary label: 0 for normal, 1 for attack
    df_train["is_attack"] = (df_train["attack_class"] != "normal").astype(int)
    df_test["is_attack"] = (df_test["attack_class"] != "normal").astype(int)

    train_csv = os.path.join(DATA_RAW_DIR, "nsl_kdd_train.csv")
    test_csv = os.path.join(DATA_RAW_DIR, "nsl_kdd_test.csv")
    df_train.to_csv(train_csv, index=False)
    df_test.to_csv(test_csv, index=False)

    print(f"[+] Saved train dataset: {train_csv} (Shape: {df_train.shape})")
    print(f"[+] Saved test dataset:  {test_csv} (Shape: {df_test.shape})")
    print("\n--- Train Attack Distribution ---")
    print(df_train["attack_class"].value_counts())
    print("\n--- Test Attack Distribution ---")
    print(df_test["attack_class"].value_counts())

if __name__ == "__main__":
    main()
