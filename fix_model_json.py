#!/usr/bin/env python3
"""
Fix InputLayer configuration in TFJS model.json if batchInputShape is missing.
"""

import json
import sys

def fix_input_layer(model_json_path):
    with open(model_json_path, 'r') as f:
        model = json.load(f)
    
    topo = model.get('modelTopology', {})
    layers = topo.get('layers', [])
    
    fixed = False
    for layer in layers:
        if layer.get('class_name') == 'InputLayer':
            config = layer.get('config', {})
            # If batchInputShape is missing but inputShape exists, add it
            if 'batchInputShape' not in config and 'inputShape' in config:
                input_shape = config['inputShape']
                # batchInputShape is [batch_size, ...inputShape]
                config['batchInputShape'] = [None] + (input_shape if isinstance(input_shape, list) else [input_shape])
                fixed = True
                print(f"✓ Fixed InputLayer: added batchInputShape = {config['batchInputShape']}")
            elif 'batchInputShape' not in config and 'batchInputShape' not in config:
                # If neither exists, add a default based on model info
                # Assuming 224x224x3 for image input
                config['batchInputShape'] = [None, 224, 224, 3]
                fixed = True
                print(f"✓ Fixed InputLayer: added default batchInputShape")
    
    if fixed:
        with open(model_json_path, 'w') as f:
            json.dump(model, f)
        print(f"✓ Model JSON updated: {model_json_path}")
    else:
        print("✓ InputLayer configuration looks correct, no changes needed")

if __name__ == '__main__':
    model_json_path = '/Users/suyogkulkarni/Desktop/Swasth-AI/public/models/simple_mobilenet_classifier/model.json'
    fix_input_layer(model_json_path)
