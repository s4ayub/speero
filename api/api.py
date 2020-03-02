import time
import sqlite3

from flask import Flask

app = Flask(__name__)

@app.route("/patients/<patient_id>")
def get_patient_metrics(patient_id):
    return {"desc": "{0}\'s dashboard".format(patient_id)}

@app.route("/audio/<patient_id>")
def get_patient_metrics(patient_id):
    return {"desc": "{0}\'s dashboard".format(patient_id)}
