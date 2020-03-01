import Mic
import MicIO
import sys
import time

import numpy as np

unfiltered_audio = []
SERVER_IP='54.198.123.14'
RX_HOST='0.0.0.0'
UNFILTERED_AUDIO_PORT=50000

def received_data(data):
    global unfiltered_audio
    unfiltered_audio += data

micIO = MicIO.MicIO()

# add filtering capabilities on a diff port later, save noise clip

rx = Mic.MicReceiver(received_data)
rx.connect(RX_HOST, UNFILTERED_AUDIO_PORT)

rx.listen()
print('Transmission was stopped.')
rx.disconnect()

micIO.save("unfiltered_audio.wav", np.asarray(unfiltered_audio))
