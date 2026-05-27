#!/usr/bin/env python3
"""
Convert H5 to SavedModel first, then to TFJS.
This is more stable for complex models.
"""

import os
import tempfile
import shutil

def convert_h5_to_tfjs_via_savedmodel(h5_path, output_dir):
    import tensorflow as tf
    import tensorflowjs as tfjs
    
    print(f"Loading model from {h5_path}...")
    model = tf.keras.models.load_model(h5_path)
    print(f"Model input shape: {model.input_shape}")
    print(f"Model layers: {len(model.layers)}")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Step 1: Save as SavedModel (TF format)
    with tempfile.TemporaryDirectory() as tmpdir:
        saved_model_path = os.path.join(tmpdir, 'saved_model')
        print(f"\nSaving as SavedModel to {saved_model_path}...")
        # For Keras 3, use export_saved_model or just save with .keras extension then convert
        try:
            # Try using export_saved_model (Keras 3)
            model.export(saved_model_path)
        except:
            # Fallback: use older method
            keras_path = os.path.join(tmpdir, 'model.keras')
            model.save(keras_path)
            saved_model_path = keras_path
        
        # Step 2: Convert SavedModel to TFJS
        print(f"Converting SavedModel to TFJS in {output_dir}...")
        tfjs.converters.convert_tf_saved_model(
            saved_model_path,
            output_dir,
            quantization_dtype_map={}  # No quantization for now
        )
    
    print(f"\n✓ Conversion complete!")
    print(f"  Output: {output_dir}")
    
    # Verify
    import json
    model_json = os.path.join(output_dir, 'model.json')
    if os.path.exists(model_json):
        with open(model_json) as f:
            m = json.load(f)
        print(f"✓ model.json created ({len(str(m))} bytes)")
        print(f"  Format: {m.get('format', 'unknown')}")
    else:
        print("ERROR: model.json not created!")

if __name__ == '__main__':
    h5_path = '/Users/suyogkulkarni/Desktop/Swasth-AI/simple_mobilenet_classifier.h5'
    output_dir = '/Users/suyogkulkarni/Desktop/Swasth-AI/public/models/simple_mobilenet_classifier'
    
    convert_h5_to_tfjs_via_savedmodel(h5_path, output_dir)
