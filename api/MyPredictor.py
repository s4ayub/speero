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

    @classmethod
    def find_word_repetitions(cls, path_transcript):
        read_file_=open(path_transcript,"r")
        lines=read_file_.readlines();

        word_prev  = ""
        start_prev = 0

        # note that the first line of wr will always be trash
        # but it gets filtered when we write to files
        wr = []
        num_rep = 0

        for i, line in enumerate(lines):
            tokens = line.split()

            if i == 0:
                word_prev = str(tokens[0])

            if word_prev == str(tokens[0]):
                if(num_rep == 0):
                    wr.append([word_prev, start_prev, ""])
                num_rep = num_rep + 1
            else:
                if num_rep != 0:
                    #num_times.append(num_rep)
                    wr[len(wr)-1][2] = num_rep
                num_rep=0
                word_prev = str(tokens[0])
                start_prev = str(tokens[1])

        if (num_rep != 0):
            wr[len(wr)-1][2] = num_rep

        return wr

    @classmethod
    def find_phrase_repetitions(cls, path_transcript):
        read_file_=open(path_transcript,"r")
        lines=read_file_.readlines();

        phrase_words = []
        reps_found = 0
        check_next = False
        start_t = 0

        phr = []
        phr.append(["", "", ""])

        phrase_words.append(str(lines[0].split()[0]))
        phrase_words.append(str(lines[1].split()[0]))
        start_ph1 = str(lines[0].split()[1])
        start_ph2 = str(lines[1].split()[1])

        for i in range(2, len(lines)-1):
            tokens = lines[i].split()

            if check_next:
                if(phrase_words[1] == str(tokens[0])):
                    if(reps_found == 0):
                        phr.append([phrase_words[0]+" "+phrase_words[1], start_ph1, ""]) # FIGURE OUT THE REST
                    reps_found += 1
                else:
                    tmp = phrase_words[0]
                    phrase_words[0] = phrase_words[1]
                    phrase_words[1] =tmp
                    start_ph1 = start_ph2
                    start_ph2 = str(tokens[1])
                    if(reps_found != 0):
                        phr[len(phr)-1][2] = reps_found
                    reps_found = 0
                check_next = False
            else: # len(phrase_words) == 2:
                if(phrase_words[0] != str(tokens[0])):
                    phrase_words[0]=phrase_words[1]
                    phrase_words[1]=str(tokens[0])
                    start_ph1 = start_ph2
                    start_ph2 = str(tokens[1])
                    if(reps_found != 0):
                        phr[len(phr)-1][2] = reps_found
                    reps_found = 0
                else:
                    check_next = True

        return phr
