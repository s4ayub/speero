import os
import tempfile

import numpy as np
import tensorflow as tf
from tensorflow import keras

imgs_per_seq = 39
img_h = 172
img_w = 128
img_c = 1

class MyPredictor(object):
    """An example Predictor for an AI Platform custom prediction routine."""

    def __init__(self, model):
        """Stores artifacts for prediction. Only initialized via `from_path`.
        """
        self._model = model

    def predict(self, instances, **kwargs):
        """Performs custom prediction.

        Preprocesses inputs, then performs prediction using the trained Keras
        model. Thresholds as well.

        Args:
            instances: A list of paths to images. If using gcloud, then format
                instance like so: "bucket_name//path/to/file.png".
            **kwargs: A dictionary of keyword args provided as additional
                fields on the predict request body.

        Returns:
            A list of outputs containing the prediction results.
        """
        imgs = map(self.decode_img, instances)
        inputs = np.asarray(imgs)
        outputs = self._model.predict(imgs)

        # If outputs are not in same order as inputs, consider that TF likely
        # runs things in parallel for multi-input???

        return [self.threshold(output) for output in outputs]

    def decode_img(self, file_path):
        """Retrieves and formats an image into a tensor (for input to model).

        Args:
            file_path: string, path to image.

        Returns:
            A tensor.
        """
        img = self.from_disk(file_path)
        img = tf.image.decode_jpeg(img, channels=1)
        img = tf.image.convert_image_dtype(img, tf.float32)
        img = tf.reshape(img, (1, imgs_per_seq, img_w, img_h, img_c))

        return img

    def from_disk(self, file_path):
        """Given file path, returns tensor from disk.

        Args:
            file_path: string, path to image.

        Returns:
            A tensor.
        """
        return tf.io.read_file(file_path)

    def threshold(self, output):
        """Maps result from model to a 0 (no stutter) or 1 (stutter) value.

        Args:
            output: numpy array, index 0 is % stutter, index 1 is % no stutter.

        Returns:
            An int.
        """

        if output[0] > output[1]:
            return 1
        else:
            return 0

    @classmethod
    def from_path(cls, model_dir):
        """Creates an instance of MyPredictor using the given path.

        This loads artifacts that have been copied from your model directory in
        Cloud Storage. MyPredictor uses them during prediction.

        Args:
            model_dir: The local directory that contains the trained Keras
                model and the pickled preprocessor instance. These are copied
                from the Cloud Storage model directory you provide when you
                deploy a version resource.

        Returns:
            An instance of `MyPredictor`.
        """
        model = keras.models.load_model(model_dir, compile=True)
        return cls(model)
