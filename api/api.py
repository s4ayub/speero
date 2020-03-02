import time
import base64
import glob
import os

from flask import Flask

app = Flask(__name__)

@app.route("/patients/<patient_id>")
def get_patient_metrics(patient_id):
    return {"desc": "{0}\'s dashboard".format(patient_id)}

@app.route("/audio/<patient_id>")
def get_patient_audio(patient_id):
    filepath = "data/%s/audio/*.wav" % (patient_id)

    list_of_files = glob.glob(filepath)
    latest_file = max(list_of_files, key=os.path.getctime)

    with open(latest_file, 'rb') as f:
        audio_encoded = base64.b64encode(f.read())

    data = {
        "content": str(audio_encoded),  # base64 string
        "sampleRate": 44100,
        "encoding": "WAV",  # maybe "MP3" should be there?
        "languageCode": "en-US",
        "speakerId": patient_id,
    }

    return data
