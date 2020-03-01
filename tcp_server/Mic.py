from MicIO import MicIO
import socket
import select
import threading
import numpy as np
import time
import sys

AudioTimeout = 0.5

SyncMessageSize = sys.getsizeof(int())
SyncTimeout = 30

class MicTransmitter:
    def __init__(self):
        self.micIO = MicIO()
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def connect(self, host, port):
        print('MicTransmitter: Connecting to %s on ports %d ...' % (host, port))

        try:
            self.socket.connect((host,port))
        except:
            print('MicTransmitter: Connection refused')
            return False

        return True

    def disconnect(self):
        self.socket.close()

    def audio_callback(self, data):
        self.socket.sendall(data)

    def start(self, device_index=None):
        self.micIO.listen(self.audio_callback, device_index)

    def stop(self):
        self.micIO.stop()

class MicReceiver:
    def __init__(self, callback):
        self.callback = callback

        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.clientsocket = None

    def connect(self, host, port):
        self.socket.bind((host, port))
        self.socket.listen(1)

        print('MicReceiver: Waiting for connections to %s on ports %d ...' % (host, port))

        (self.clientsocket, _) = self.socket.accept()

        print('MicReceiver: Mic connection established')

    def disconnect(self):
        self.socket.close()

    def listen(self):
        while True:
            data = self.clientsocket.recv(MicIO.FramesPerBuffer)
            if not data:
                break

            data = np.frombuffer(data, dtype=np.int16).tolist()
            if self.callback:
                self.callback(data)
