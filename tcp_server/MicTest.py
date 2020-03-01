import Mic
import sys
import time

HOST='localhost'
PORT=2000

def received_data(data):
    pass

mode = sys.argv[1]

if mode == 'rx':
    rx = Mic.MicReceiver(received_data)
    rx.connect(HOST, PORT)

    rx.listen()
    print('Transmission was stopped.')
    rx.disconnect()

if mode == 'tx':
    msg = 3
    tx = Mic.MicTransmitter()
    success = tx.connect(HOST, PORT)

    if success:
        tx.start()
        input('Press any key to stop.')
        tx.stop()
        print('Stopping transmission.')
        tx.disconnect()
