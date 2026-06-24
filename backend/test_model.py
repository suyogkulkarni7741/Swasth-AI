import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

print("Test 1: tensorflow.keras.models (Keras 3)")
try:
    import tensorflow as tf
    model = tf.keras.models.load_model('efficientnet_b0_final_nb.keras', compile=False)
    print("Success with tf.keras")
except Exception as e:
    print(f"Failed: {e}")

print("Test 2: tf_keras.models (Keras 2)")
try:
    import tf_keras
    model = tf_keras.models.load_model('efficientnet_b0_final_nb.keras', compile=False)
    print("Success with tf_keras")
except Exception as e:
    print(f"Failed: {e}")
