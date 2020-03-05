import React, { useState, useEffect } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import PatientItem from './PatientItem.js';
import { makeStyles } from '@material-ui/core/styles';
import SectionHeader from './SectionHeader.js';

import './mailchimp.css';
import PatientMap from './PatientMap.js';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams,
    useRouteMatch
  } from "react-router-dom";

const styles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    backgroundPosition: '0 400px',
    marginTop: 20,
    padding: 20,
  },
  grid: {
    width: 1000
  },
  paper: {
    padding: theme.spacing.unit * 3,
    textAlign: 'left',
    color: theme.palette.text.secondary
  }
}));

const Percent = (value) => {
    return Math.round(value * 100 / 1024)
}

function Patients(props) {
    const classes = styles(props.theme);
    const [data, setData] = useState(PatientMap);
    let { path, url } = useRouteMatch();

    return (
    <div>
        <Switch>
            <Route exact path={path}>
                <React.Fragment>
                    <CssBaseline />
                    <div className={classes.root}>
                    <Grid container justify="center">
                        <Grid spacing={24} alignItems="center" justify="cnter" container className={classes.grid}>
                        <Grid item xs={12}>
                            <SectionHeader theme={props.theme} title="Patients" subtitle="View dashboards of active patients" />
                            {data.map(r =>  {
                                return r.patientId &&
                                <div style={{marginTop: 20}}>
                                    <PatientItem theme={props.theme} name={r.name} at={r.lastSession} lastReading={Percent(r.lastScore)} patientId={r.patientId} name={r.name} linkto={`${path}/${r.patientId}`} />
                                </div>
                            })}
                        </Grid>
                        </Grid>
                    </Grid>
                    </div>
                </React.Fragment>
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
      fetch(`/metric/${patientId}`).then(res => res.json()).then(data => {
        console.log(data);
        setMetrics(data);
      });
    }, []);


    return (
      <div>
        <p>metric guy</p>
        {metrics === 0 ? (
          <p>loading guy</p>
        ) : (
          <button onClick={() => console.log(metrics)}>
            Activate lasers
          </button>
        )}
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
        {transcriptions === 0 ? (
          <p>loading guy</p>
        ) : (
          <button onClick={() => console.log(transcriptions)}>
            Activate lasers
          </button>
        )}
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
        {encodedAudio === 0 ? (
          <p>loading guy</p>
        ) : (
          <button onClick={() => playAudio(encodedAudio.content)}>
            Activate lasers
          </button>
        )}
      </div>
    );
  }

export default Patients;
