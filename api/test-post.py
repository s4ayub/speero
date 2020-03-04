import requests
import base64

url = 'http://127.0.0.1:5000/audio'

audio_filepath = "data/patient_0/audio/Feb-25-2020-00-04-50-628169.wav"

with open(audio_filepath, 'rb') as f:
    audio_encoded = base64.b64encode(f.read())

myobj = {
    "content": audio_encoded,
    "sampleRate": 44100,
    "encoding": "WAV",
    "languageCode": "en-US",
    "patient_id": "patient_1",
}
x = requests.post(url, data = myobj)

print(x.text)
