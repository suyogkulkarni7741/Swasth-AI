import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import keras
    print("Building model...")
    base = keras.applications.EfficientNetB0(include_top=False, weights=None, input_shape=(224,224,3))
    model = keras.Sequential([
        base,
        keras.layers.GlobalAveragePooling2D(),
        keras.layers.BatchNormalization(),
        keras.layers.Dense(256, activation='relu'),
        keras.layers.Dropout(0.5), # Sometimes there's dropout
        keras.layers.Dense(73, activation='softmax')
    ])
    
    print("Loading weights...")
    model.load_weights('efficientnet_b0_final_nb.keras', skip_mismatch=True)
    print("Weights loaded successfully!")
    
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Failed to load weights: {e}")
