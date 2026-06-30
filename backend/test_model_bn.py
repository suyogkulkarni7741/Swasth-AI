import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import keras
    from keras.layers import BatchNormalization
    
    class CustomBN(BatchNormalization):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)
            
    print("Testing custom objects BN loading with Keras...")
    model = keras.models.load_model(
        'efficientnet_b0_final_nb.keras', 
        custom_objects={'BatchNormalization': CustomBN, 'batch_normalization': CustomBN}, 
        compile=False
    )
    print("Success with custom BN!")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Failed custom BN: {e}")
