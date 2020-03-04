import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";

export default function App() {

  return (
    <div className="App">
    <header className="App-header">
      <Router>
        nav bar??
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/patients">Patients</Link>
          </li>
      </ul>

      <div>
        <hr />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/patients">
            <Patients />
          </Route>
        </Switch>
      </div>

    </Router>
    </header>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function Patients() {
  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.
  let { path, url } = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route exact path={path}>
          <h2>Profiles</h2>
          <ul>
            <li>
              <Link to={`${url}/patient_0`}>patient_0</Link>
            </li>
            <li>
              <Link to={`${url}/patient_1`}>patient_1</Link>
            </li>
            <li>
              <Link to={`${url}/patient_2`}>patient_2</Link>
            </li>
          </ul>
          <h3>Please select a patient.</h3>
        </Route>
        <Route path={`${path}/:patientId`}>
          <Metrics />
          <hr />
          <Transcriptions />
          <hr />
          <SessionAudio />
        </Route>
      </Switch>
    </div>
  );
}

function Metrics() {
  let { patientId } = useParams();

  const [metrics, setMetrics] = useState(0);

  useEffect(() => {
    fetch(`/patients/${patientId}`).then(res => res.json()).then(data => {
      setMetrics(data);
    });
  }, []);


  return (
    <div>
      <p>metric guy</p>
      <button onClick={() => console.log(metrics)}>
        Activate metrics
      </button>
    </div>
  );
}

function Transcriptions() {
  let { patientId } = useParams();

  const [transcriptions, setTranscriptions] = useState(0);

  useEffect(() => {
    fetch(`/transcription/${patientId}`).then(res => res.json()).then(data => {
      setTranscriptions(data);
    });
  }, []);

  return (
    <div>
      <p>transcription guy</p>
      <button onClick={() => console.log(transcriptions)}>
        Activate transcriptions
      </button>
    </div>
  );
}

function SessionAudio() {
  let { patientId } = useParams();

  const [encodedAudio, setEncodedAudio] = useState(0);

  useEffect(() => {
    fetch(`/audio/${patientId}`).then(res => res.json()).then(data => {
      setEncodedAudio(data);
    });
  }, []);

  function playAudio(json_base64string) {
    var snd = new Audio("data:audio/wav;base64," + json_base64string.substring(2, json_base64string.length-1));
    snd.play();
  };

  return (
    <div>
      <p>audio guy</p>
      <button onClick={() => playAudio(encodedAudio.content)}>
        Activate lasers
      </button>
    </div>
  );
}
