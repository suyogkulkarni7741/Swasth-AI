import zipfile
import json
import os
import shutil

keras_file = "efficientnet_b0_final_nb.keras"
backup_file = "efficientnet_b0_final_nb.keras.bak"
temp_dir = "temp_keras_extract"

if not os.path.exists(backup_file):
    shutil.copy(keras_file, backup_file)

os.makedirs(temp_dir, exist_ok=True)
with zipfile.ZipFile(keras_file, 'r') as zip_ref:
    zip_ref.extractall(temp_dir)

config_path = os.path.join(temp_dir, 'config.json')
with open(config_path, 'r') as f:
    config_data = json.load(f)

# Fix batch_shape to batch_input_shape in config
config_str = json.dumps(config_data)
config_str = config_str.replace('"batch_shape":', '"batch_input_shape":')
config_data = json.loads(config_str)

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
print("Successfully patched batch_shape in .keras file")
