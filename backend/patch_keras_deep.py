import zipfile
import json
import os
import shutil

keras_file = "efficientnet_b0_final_nb.keras"
backup_file = "efficientnet_b0_final_nb.keras.bak2"
temp_dir = "temp_keras_extract_full"

if not os.path.exists(backup_file):
    shutil.copy(keras_file, backup_file)

os.makedirs(temp_dir, exist_ok=True)
with zipfile.ZipFile(keras_file, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)

config_path = os.path.join(temp_dir, 'config.json')
with open(config_path, 'r') as f:
    config_data = json.load(f)

def fix_dict(d):
    if isinstance(d, dict):
        # Fix dtype dicts
        if "dtype" in d and isinstance(d["dtype"], dict):
            if "config" in d["dtype"] and "name" in d["dtype"]["config"]:
                d["dtype"] = d["dtype"]["config"]["name"]
        
        # Fix batch_shape
        if "batch_shape" in d:
            d["batch_input_shape"] = d.pop("batch_shape")
            
        for k, v in d.items():
            fix_dict(v)
    elif isinstance(d, list):
        for item in d:
            fix_dict(item)

fix_dict(config_data)

with open(config_path, 'w') as f:
    json.dump(config_data, f, indent=2)

# Repackage the keras file
with zipfile.ZipFile(keras_file, 'w') as zip_ref:
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, temp_dir)
            zip_ref.write(file_path, arcname)

shutil.rmtree(temp_dir)
print("Successfully deep patched .keras file for Keras 2 compatibility")
