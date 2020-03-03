import time
import base64
import glob
import os

from flask import Flask
from MyPredictor import MyPredictor
import pandas as pd

import tensorflow as tf
from tensorflow import keras

app = Flask(__name__)

p = MyPredictor.from_path(".")

@app.route("/patients/<patient_id>")
def get_patient_metrics(patient_id):
    patient_dir = "data/%s/" % (patient_id)
    latest_recorded_audio_path = get_latest_file_in_dir(
        patient_dir + "audio/*.wav"
    )
    metrics = pd.read_csv(
        patient_dir + "sound_repetition.csv",
        dtype={'stutter_segments': str}
    )
    if latest_metrics_collected(latest_recorded_audio_path, metrics):
        return metrics.to_dict('index')

    # Spectrogram prediction
    latest_metric = get_latest_metric(
        latest_recorded_audio_path,
        patient_dir + "spectrograms/*.png"
    )
    metrics = metrics.append(latest_metric, ignore_index=True)
    metrics.to_csv(patient_dir + "sound_repetition.csv", index = False)

    return metrics.to_dict('index')

@app.route("/audio/<patient_id>")
def get_patient_audio(patient_id):
    audio_filepath = get_latest_file_in_dir(
        "data/%s/audio/*.wav" % (patient_id)
    )

    with open(audio_filepath, 'rb') as f:
        audio_encoded = base64.b64encode(f.read())

    data = {
        "content": str(audio_encoded),
        "sampleRate": 44100,
        "encoding": "WAV",
        "languageCode": "en-US",
        "speakerId": patient_id,
    }

    return data

def get_latest_file_in_dir(filepath):
    list_of_files = glob.glob(filepath)
    latest_file = max(list_of_files, key=os.path.getctime)

    return latest_file

def latest_metrics_collected(audio_filepath, metrics):
    recorded_session = get_session_timestamp(audio_filepath)
    last_tracked_session = metrics.iloc[-1]["session_timestamp"]

    return recorded_session == last_tracked_session

def get_latest_metric(audio_filepath, spectrograms_filepath):
    global p
    img_paths = glob.glob(spectrograms_filepath)
    results = p.predict(img_paths)

    # Note down the segments (4s clips) that saw stutters
    stutter_segments_record = ""
    segments_without_stutters = 0
    for i, r in enumerate(results):
        if r == 1:
            stutter_segments_record += str(i) + "-"
        else:
            segments_without_stutters += 1

    return {
        "session_timestamp": get_session_timestamp(audio_filepath),
        "score": (segments_without_stutters / len(results))*100,
        "stutter_segments": stutter_segments_record[:-1],
    }

def get_session_timestamp(audio_filepath):
    return audio_filepath.split("/")[-1][:-4]
