import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';

import DashboardMap from './DashboardMap.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { useParams } from "react-router-dom";
import CardMedia from '@material-ui/core/CardMedia';
import ReactAudioPlayer from 'react-audio-player';

const styles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    backgroundPosition: '0 400px',
    marginTop: 20,
    padding: 20,
  },
  grid: {
    width: 1200,
    margin: `0 ${theme.spacing.unit * 2}px`,
    [theme.breakpoints.down('sm')]: {
      width: 'calc(100% - 20px)'
    }
  },
  loadingState: {
    opacity: 0.05
  },
  paper: {
    padding: theme.spacing.unit * 3,
    textAlign: 'left',
    color: theme.palette.primary
  },
  rangeLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.unit * 2
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  outlinedButtom: {
    textTransform: 'uppercase',
    marginTop: theme.spacing.unit
  },
  actionButtom: {
    textTransform: 'uppercase',
    margin: theme.spacing.unit,
    width: 152,
    height: 36
  },
  blockCenter: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center'
  },
  block: {
    padding: theme.spacing.unit * 2,
  },
  loanAvatar: {
    display: 'inline-block',
    verticalAlign: 'center',
    width: 16,
    height: 16,
    marginRight: 10,
    marginBottom: -2,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main
  },
  interestAvatar: {
    display: 'inline-block',
    verticalAlign: 'center',
    width: 16,
    height: 16,
    marginRight: 10,
    marginBottom: -2,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.light
  },
  inlining: {
    display: 'inline-block',
    marginRight: 10
  },
  buttonBar: {
    display: 'flex'
  },
  noBorder: {
    borderBottomStyle: 'hidden'
  },
  mainBadge: {
    textAlign: 'center',
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4
  }
}));

// /* <Metrics />
// <hr />
// <Transcriptions />
// <hr />
// <SessionAudio /> */

export default function Dashboard(props) {
    const classes = styles(props.theme);

    return (
        <React.Fragment>
            <CssBaseline />
            <div className={classes.root}>
                <Grid container justify="center">
                    < Metrics theme={props.theme} />
                </Grid>
            </div>
        </React.Fragment>
    )
}

function Metrics(props) {
    let { patientId } = useParams();

    const classes = styles(props.theme);
    const [metrics, setMetrics] = useState(0);

    useEffect(() => {
      fetch(`/metric/${patientId}`).then(res => res.json()).then(data => {
        setMetrics(data);
      });
    }, []);

    return (
        <div>
        <Grid spacing={2} alignItems="flex-start" justify="center" container className={classes.grid}>
            <Grid item xs={12}>
                <div className={classes.topBar}>
                    <div className={classes.block}>
                        <Typography variant="h4" gutterBottom>
                            {DashboardMap[patientId].name}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Patient ID: </strong>  {patientId}
                        </Typography>
                    </div>
                </div>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper className={classes.paper} style={{position: 'relative'}}>
                    <Typography variant="subtitle1" gutterBottom>
                        <strong>Sound Repetition</strong> - Most Recent Session
                    </Typography>
                    {metrics === 0 ? (
                        <span>
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                        </span>
                    ) : (
                        <div>
                            <Doughnut data={doughdata(metrics)} />
                            <br/>
                            <Typography variant="subtitle3" gutterBottom>
                                {getLatestTimestamp(metrics)}
                            </Typography>
                        </div>
                    )}
                    <SessionAudio />
                </Paper>
            </Grid>
            <Grid item xs={12} md={8} >
                <Paper className={classes.paper} style={{position: 'relative'}}>
                    <div >
                        <Typography variant="subtitle1" gutterBottom>
                            <strong>Sound Repetition</strong> - Historical Data
                        </Typography>
                        {metrics === 0 ? (
                            <span>
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                                <Skeleton animation="wave" />
                            </span>
                        ) : (
                            <div>
                                <Line data={linedata(metrics)} options={lineOptions} />
                            </div>
                        )}
                    </div>
                </Paper>
            </Grid>
        </Grid>
        < Transcriptions theme={props.theme} />
        </div>
    );
}

function Transcriptions(props) {
    let { patientId } = useParams();

    const [transcriptions, setTranscriptions] = useState(0);

    const classes = styles(props.theme);

    useEffect(() => {
        fetch(`/transcription/${patientId}`).then(res => res.json()).then(data => {
            debugger;
        setTranscriptions(data);
        });
    }, []);

    return (
        <Grid spacing={2} alignItems="flex-start" justify="center" container className={classes.grid}>
        <Grid item xs={12} md={6} >
        <Paper className={classes.paper} style={{position: 'relative'}}>
            <div >
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Phrase Repetition</strong> - Most Recent Session
                </Typography>
                {transcriptions === 0 ? (
                    <span>
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                    </span>
                ) : (
                    <p>dfdf</p>
                )}
            </div>
        </Paper>
    </Grid>
    <Grid item xs={12} md={6} >
        <Paper className={classes.paper} style={{position: 'relative'}}>
            <div >
                <Typography variant="subtitle1" gutterBottom>
                    <strong>Word Repetition</strong> - Most Recent Session
                </Typography>
                {transcriptions === 0 ? (
                    <span>
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                    </span>
                ) : (
                    <p>dfdf</p>
                )}
            </div>
        </Paper>
    </Grid>
        </Grid>
    );
}

function SessionAudio() {
    let { patientId } = useParams();

    const [encodedAudio, setEncodedAudio] = useState(0);

    useEffect(() => {
        fetch(`/audio/${patientId}`).then(res => res.json()).then(data => {
            var snd = new Audio("data:audio/wav;base64," + data.content.substring(2, data.content.length-1));
            setEncodedAudio(snd.src);
        });
    }, []);

    return (
        <div>
            <Typography variant="subtitle2" gutterBottom>
                <br />
                <br />
                <br />
                <strong>Audio</strong>
                <hr/>
                <br />
            </Typography>
            {encodedAudio === 0 ? (
                <Skeleton animation="wave" />
            ) : (
                <Grid spacing={2} alignItems="flex-start" justify="center" container >
                    <ReactAudioPlayer
                        src={encodedAudio}
                        controls
                    />
                </Grid>
            )}
        </div>
    );
}

function getLatestScore(metrics) {
    const keys = Object.keys(metrics).map(x => parseInt(x));
    const latestKey = Math.max(...keys);

    return metrics[latestKey].score;
}

function getLatestTimestamp(metrics) {
    const keys = Object.keys(metrics).map(x => parseInt(x));
    const latestKey = Math.max(...keys);

    return metrics[latestKey].session_timestamp;
}


const linedata = metrics => {
    const allKeys= Object.keys(metrics).sort();
    const allData = [];
    const allLabels = [];

    allKeys.forEach(k => {
        allData.push(metrics[k].score);
        let ts = metrics[k].session_timestamp;
        allLabels.push(ts.slice(0, ts.length - 16));
    });

    return {
        labels: allLabels,
        datasets: [
        {
            label: "% of audio without sound repetition",
            data: allData,
            borderColor: "#2979FF",
            backgroundColor: "rgba(225, 228, 232, 0.5)",
            pointBackgroundColor: "#EA1E63",
            pointBorderWidth: 0,
        }]
    };
}

const lineOptions = {
    responsive: true,
    tooltips: {
        mode: 'label'
    },
    scales: {
        xAxes: [
        {
            display: true,
            scaleLabel: {
            show: true,
            labelString: 'Session'
            }
        }
        ],
        yAxes: [
        {
            display: true,
            scaleLabel: {
            show: true,
            labelString: 'Score - % Not Stuttered'
            },
            ticks: {
            suggestedMin: 0,
            suggestedMax: 100
            }
        }
        ]
    }
}

const doughdata = metrics => {
    const latestScore = getLatestScore(metrics);

    return {
        datasets: [{
            data: [100-latestScore, latestScore],
            backgroundColor: ["#EA1E63", "#2979FF"],
        }],
        labels: [
            'Sound Repetition',
            'No Sound Repetition'
        ]
    };
};
