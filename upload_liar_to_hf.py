# ============================================================
# FakeVerifier Dataset Loader & Uploader
# Author: Preetham Devulapally (pdevulapally)
# Purpose: Download LIAR dataset, convert to JSONL, upload to HF dataset repo
# ============================================================

import os
import json
import pandas as pd
from typing import Dict, List
from huggingface_hub import HfApi

# -------- CONFIG (ENV-ONLY, no hardcoded secrets/URLs) --------
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN") or os.getenv("HF_TOKEN") or ""
HF_DATASET_REPO = os.getenv("HF_DATASET_REPO", "").strip()

LIAR_TRAIN_URL = os.getenv("LIAR_TRAIN_URL", "").strip()
LIAR_VALID_URL = os.getenv("LIAR_VALID_URL", "").strip()
LIAR_TEST_URL  = os.getenv("LIAR_TEST_URL",  "").strip()

if not HF_TOKEN:
    raise RuntimeError("Missing HUGGINGFACE_TOKEN/HF_TOKEN in environment.")
if not HF_DATASET_REPO:
    raise RuntimeError("Missing HF_DATASET_REPO in environment (e.g., 'owner/dataset-name').")

# Optional per-split URLs from env; if unset we fall back to the datasets library
DATASET_URLS: Dict[str, List[str]] = {
    "train": [u for u in [LIAR_TRAIN_URL] if u],
    "validation": [u for u in [LIAR_VALID_URL] if u],
    "test": [u for u in [LIAR_TEST_URL] if u],
}

# -------- DOWNLOAD + CONVERT --------
def _read_liar_split(split: str) -> pd.DataFrame:
    last_err = None
    for url in DATASET_URLS.get(split, []):
        try:
            df = pd.read_csv(url, sep="\t", header=None, quoting=3, on_bad_lines="skip")
            # Expect 8 columns in classic LIAR; some mirrors include 9-13. We map best-effort.
            if df.shape[1] >= 8:
                # Standard order (label first, statement second) for many mirrors
                # Try to coerce to 8 relevant columns
                df = df.iloc[:, :8]
                df.columns = [
                    "label",
                    "statement",
                    "subject",
                    "speaker",
                    "job_title",
                    "state_info",
                    "party_affiliation",
                    "context",
                ]
            else:
                # Fallback: assign minimal columns
                cols = ["label", "statement"] + [f"col{i}" for i in range(df.shape[1]-2)]
                df.columns = cols
                for c in ["subject","speaker","job_title","state_info","party_affiliation","context"]:
                    if c not in df.columns:
                        df[c] = ""
            return df
        except Exception as e:
            last_err = e
    # Fallback: try Hugging Face datasets library if available
    try:
        from datasets import load_dataset  # type: ignore
        ds = load_dataset("liar", trust_remote_code=True)
        mapping = {
            "train": "train",
            "validation": "validation",
            "test": "test",
        }
        split_name = mapping.get(split, split)
        d = ds[split_name].to_pandas()
        # HF "liar" has these columns: label, statement, subject, speaker, job_title, state_info, party_affiliation, context
        return d[[
            "label","statement","subject","speaker","job_title","state_info","party_affiliation","context"
        ]]
    except Exception as e:
        raise RuntimeError(
            f"Failed to download LIAR {split} split from all mirrors and datasets fallback. Last error: {last_err or e}"
        )


def download_and_convert():
    os.makedirs("converted", exist_ok=True)
    results = {}

    for split in ["train","validation","test"]:
        print(f"📥 Downloading {split} data...")
        df = _read_liar_split(split)

        # Convert into FakeVerifier schema
        data = []
        for _, row in df.iterrows():
            data.append({
                "claim": str(row["statement"]),
                "label": str(row["label"]),
                "source": str(row["speaker"]) if not pd.isna(row["speaker"]) else "",
                "context": str(row["context"]) if not pd.isna(row["context"]) else "",
            })

        output_path = f"converted/liar_{split}.jsonl"
        with open(output_path, "w", encoding="utf-8") as f:
            for item in data:
                f.write(json.dumps(item) + "\n")

        results[split] = {
            "count": len(data),
            "path": output_path
        }
        print(f"✅ {split} saved as {output_path} ({len(data)} samples)")

    return results


# -------- UPLOAD TO HUGGING FACE --------
def upload_to_huggingface(files_dict):
    print("\n🚀 Uploading to Hugging Face dataset repo...")
    api = HfApi(token=HF_TOKEN)

    # Create repo if not exists
    try:
        api.create_repo(repo_id=HF_DATASET_REPO, repo_type="dataset", private=True, exist_ok=True)
    except Exception as e:
        print(f"⚠️ Repo already exists or cannot be created: {e}")

    for split, info in files_dict.items():
        api.upload_file(
            path_or_fileobj=info["path"],
            path_in_repo=f"data/liar_{split}.jsonl",
            repo_id=HF_DATASET_REPO,
            repo_type="dataset",
            commit_message=f"Auto-upload LIAR {split} split ({info['count']} records)",
        )
        print(f"✅ Uploaded {split} → {HF_DATASET_REPO}/data/liar_{split}.jsonl")

    print("\n🎉 All splits uploaded successfully!")
    print(f"View your dataset here: https://huggingface.co/datasets/{HF_DATASET_REPO}")


if __name__ == "__main__":
    print("🧠 Starting FakeVerifier LIAR dataset preparation...")
    files = download_and_convert()
    upload_to_huggingface(files)
    print("\n🏁 Done. You’re ready to train your model, bro!")
