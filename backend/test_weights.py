import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np

try:
    import keras
    print("Building model...")
    base_model = keras.applications.EfficientNetB0(include_top=False, input_shape=(224,224,3), pooling='avg')
    outputs = keras.layers.Dense(73, activation='softmax')(base_model.output)
    model = keras.Model(inputs=base_model.input, outputs=outputs)
    
    print("Loading weights from .keras file...")
    model.load_weights('efficientnet_b0_final_nb.keras')
    print("Weights loaded successfully!")
    
    # Test predict
    dummy = np.zeros((1, 224, 224, 3))
    preds = model.predict(dummy, verbose=0)
    print("Prediction test success. Shape:", preds.shape)
    
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Failed to load weights: {e}")
