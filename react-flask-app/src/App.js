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
            <Topics />
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

function Topics() {
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
        <Route path={`${path}/:topicId`}>
          <Topic />
        </Route>
      </Switch>
    </div>
  );
}

function Topic() {
  // The <Route> that rendered this component has a
  // path of `/topics/:topicId`. The `:topicId` portion
  // of the URL indicates a placeholder that we can
  // get from `useParams()`.
  let { topicId } = useParams();

  const [currentTime, setCurrentTime] = useState({"desc": ""});

  useEffect(() => {
    fetch(`/audio/${topicId}`).then(res => res.json()).then(data => {
      console.log(data);
      setCurrentTime(data);
    });
  }, []);

  function playAudio(json_base64string) {
    var snd = new Audio("data:audio/wav;base64," + json_base64string.substring(2, json_base64string.length-1));
    snd.play();
  };

  return (
    <div>
      <h3>{topicId}</h3>
      <h2>current time is {currentTime.languageCode}</h2>
      <button onClick={() => playAudio(currentTime.content)}>
        Activate lasers
      </button>
    </div>
  );
}
