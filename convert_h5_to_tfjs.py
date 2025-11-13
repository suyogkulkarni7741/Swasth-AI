#!/usr/bin/env python3
"""
Convert a Keras .h5 model to TensorFlow.js (TFJS) Layers format.
Usage:
  python convert_h5_to_tfjs.py <input_h5_path> [output_dir]
Example:
  python convert_h5_to_tfjs.py simple_mobilenet_classifier.h5 public/models/simple_mobilenet_classifier
"""

import sys
import os
import json

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    input_h5 = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "public/models/simple_mobilenet_classifier"
    
    if not os.path.exists(input_h5):
        print(f"Error: File '{input_h5}' not found.")
        sys.exit(1)
    
    print(f"Converting {input_h5} to TFJS format...")
    print(f"Output directory: {output_dir}")
    
    try:
        import tensorflow as tf
        import tensorflowjs as tfjs
        import tempfile
        
        # Load model
        model = tf.keras.models.load_model(input_h5)
        print(f"Model loaded. Input shape: {model.input_shape}")
        
        # Create output dir if needed
        os.makedirs(output_dir, exist_ok=True)
        
        # Try direct conversion first
        try:
            tfjs.converters.save_keras_model(model, output_dir)
            print(f"✓ Conversion complete (direct method)!")
        except Exception as e1:
            print(f"Direct conversion failed, trying SavedModel approach: {e1}")
            # Fallback: convert to SavedModel first, then to TFJS
            with tempfile.TemporaryDirectory() as tmpdir:
                saved_model_path = os.path.join(tmpdir, "saved_model")
                model.save(saved_model_path, save_format='tf')
                tfjs.converters.convert_tf_saved_model(saved_model_path, output_dir)
                print(f"✓ Conversion complete (SavedModel method)!")
        
        print(f"  - model.json created at {output_dir}/model.json")
        print(f"  - Weight shards created in {output_dir}/")
        
        # Verify model.json exists and is valid
        model_json_path = os.path.join(output_dir, 'model.json')
        if os.path.exists(model_json_path):
            with open(model_json_path, 'r') as f:
                model_json = json.load(f)
            print(f"✓ Model JSON validated. Format version: {model_json.get('format', 'unknown')}")
        else:
            print("Warning: model.json not found after conversion")
        
    except ImportError:
        print("Error: TensorFlow and tensorflowjs are required.")
        print("Install with:")
        print("  pip install tensorflow tensorflowjs")
        sys.exit(1)
    except Exception as e:
        print(f"Error during conversion: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
