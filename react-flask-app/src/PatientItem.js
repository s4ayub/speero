import React, { useState, Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import SpaIcon from '@material-ui/icons/Spa';
import ButtonBar from './ButtonBar.js';
import { pink, grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing.unit * 3,
    textAlign: 'left',
    color: theme.palette.text.secondary
  },
  avatar: {
    margin: 10,
    backgroundColor: theme.palette.grey['200'],
    color: theme.palette.text.primary,
  },
  avatarContainer: {
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      marginBottom: theme.spacing.unit * 4
    }
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  },
  baseline: {
    alignSelf: 'baseline',
    width: '100%',
    marginLeft: theme.spacing.unit * 2,
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'center',
      alignItems: 'center',
      width: '100%',
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
      marginLeft: 0
    }
  },
  inline: {
    display: 'inline-block',
    marginLeft: theme.spacing.unit * 4,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0
    }
  },
  inlineRight: {
    width: '60%',
    textAlign: 'right',
    marginLeft: 50,
    alignSelf: 'flex-end',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      margin: 0,
      textAlign: 'center'
    }
  },
  backButton: {
    marginRight: theme.spacing.unit * 2
  }
}));

function PatientItem(props) {
    const { theme, patientId, name, at, lastReading, linkto} = props;
    const classes = styles(theme);
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <div className={classes.itemContainer}>
            <div className={classes.avatarContainer}>
              <Avatar className={classes.avatar}>
                <SpaIcon />
              </Avatar>
            </div>
            <div className={classes.baseline}>
              <div className={classes.inline}>
                <Typography style={{ textTransform: 'uppercase' }} color='primary' gutterBottom>
                  Patient Id
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {patientId}
                </Typography>
              </div>
              { at && (
              <div className={classes.inline}>
                <Typography style={{ textTransform: 'uppercase' }} color='primary' gutterBottom>
                  Last Session
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {at}
                </Typography>
              </div>
              )}
            </div>
            <div className={classes.inlineRight}>
              <Typography style={{ textTransform: 'uppercase' }} color='secondary' gutterBottom>
                Name
              </Typography>
              <Typography variant="h4" gutterBottom>
                {name}
              </Typography>
              <ButtonBar patientLink={linkto} />
            </div>
          </div>
        </Paper>
      </div>
    )
  }

export default PatientItem;
