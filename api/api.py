import time
import base64
import glob
import os
import os.path
from os import path
from datetime import datetime

import pandas as pd
from flask import Flask
from flask import request
from google.cloud import speech_v1
from MyPredictor import MyPredictor

app = Flask(__name__)

audio_path_in_gcloud = 'gs://speero-aiplatform/audio/'
sclient_config = {
    "enable_word_time_offsets": True,
    "language_code": "en-GB",
    "sample_rate_hertz": 44100,
}

sclient = speech_v1.SpeechClient()
#p = MyPredictor.from_path(".")

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

@app.route("/transcription/<patient_id>")
def get_patient_transcription(patient_id):
    global sclient
    global sclient_config

    patient_dir = "data/%s/" % (patient_id)
    latest_recorded_audio_path = get_latest_file_in_dir(
        patient_dir + "audio/*.wav"
    )
    session_timestamp = get_session_timestamp(latest_recorded_audio_path)
    transcription_dir_path = patient_dir + "transcriptions/" + session_timestamp

    # check if dir already exists for this session
    if path.exists(transcription_dir_path):
        wr_df = pd.read_csv(transcription_dir_path + "/wr.csv")
        pr_df = pd.read_csv(transcription_dir_path + "/pr.csv")
        transcription_df = pd.read_csv(transcription_dir_path + "/transcription.csv")

        return build_transcription_payload(wr_df, pr_df, transcription_df)

    # Create transcription data for this session
    # Change the "1.wav" part when the tcp socket can write audio`
    # files to gcloud buckets.
    audio = {"uri": audio_path_in_gcloud + patient_id + "/1.wav"}
    operation = sclient.long_running_recognize(sclient_config, audio)
    response = operation.result()

    os.mkdir(transcription_dir_path)
    path_to_transcription_file = transcription_dir_path + "/transcription.txt"

    writeFile = open(path_to_transcription_file,'w')
    transcription_df = pd.DataFrame(columns=['word','start_time','end_time'])
    for result in response.results:
        alternative = result.alternatives[0]
        for i, word in enumerate(alternative.words):
            writeFile.write(word.word + " " + str(word.start_time.seconds) + " " + str(word.end_time.seconds) +  "\n")
            transcription_df = transcription_df.append({
                "word": word.word,
                "start_time": str(word.start_time.seconds),
                "end_time": str(word.end_time.seconds),
            }, ignore_index=True)
    writeFile.close()
    transcription_df.to_csv(transcription_dir_path + "/transcription.csv", index = False)

    wr = MyPredictor.find_word_repetitions(path_to_transcription_file)
    pr = MyPredictor.find_phrase_repetitions(path_to_transcription_file)

    # First row is always messed up
    wr.pop(0)
    pr.pop(0)

    wr_df = write_pr_wr_data(wr, transcription_dir_path + "/wr.csv")
    pr_df = write_pr_wr_data(pr, transcription_dir_path + "/pr.csv")

    return build_transcription_payload(wr_df, pr_df, transcription_df)

@app.route("/audio/<patient_id>", methods=['GET'])
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

@app.route("/audio", methods=['POST'])
def create_patient_audio():
    wav_data = base64.b64decode(request.form["content"])
    new_audio_path = "data/%s/audio/%s.wav" % (
        request.form["patient_id"],
        datetime.now().strftime("%b-%d-%Y-%H-%M-%S-%f")
    )
    with open(new_audio_path, mode='bx') as f:
        f.write(wav_data)

    return request.form["patient_id"], 201

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

def write_pr_wr_data (wr_or_pr_data, transcription_wr_or_pr_path):
    df = pd.DataFrame(columns=['word','start_time','num_reps'])

    for i, data in enumerate(wr_or_pr_data):
        df.loc[i] = [str(data[0]), str(data[1]), str(data[2])]

    df.to_csv(transcription_wr_or_pr_path, index=False)

    return df

def build_transcription_payload(wr_df, pr_df, transcription_df):
    return {
        "wr": wr_df.to_dict('index'),
        "pr": pr_df.to_dict('index'),
        "transcription": transcription_df.to_dict('index'),
    }
