from datasets import load_dataset, ClassLabel

print("🚀 Loading dataset from Hub...")
ds = load_dataset("pdevulapally/fakeverifier-dataset")

# Define your class names (adjust if needed)
label_names = ["fake", "true"]
label_class = ClassLabel(names=label_names)

def map_labels(example):
    label = str(example["label"]).lower().strip()
    if label in ["true", "mostly-true"]:
        example["label"] = 1
    else:
        example["label"] = 0
    return example

print("🔄 Mapping labels...")
ds = ds.map(map_labels)

print("🧱 Casting label column to ClassLabel type...")
ds = ds.cast_column("label", label_class)

print("☁️ Pushing fixed dataset to Hugging Face Hub...")
ds.push_to_hub("pdevulapally/fakeverifier-dataset", private=False)

print("✅ Dataset fixed and reuploaded successfully!")
