import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Button from '@material-ui/core/Button';

import { Link } from "react-router-dom";

const styles = theme => ({
  primary: {
    marginRight: theme.spacing.unit * 2,
    display: 'inline-block'
  },
  secondary: {
    display: 'inline-block',
    marginLeft: theme.spacing.unit * 2
  },
  spaceTop: {
    marginTop: 20
  }
})

class ButtonBar extends Component {
  render() {
    const { classes, patientLink } = this.props;

    return (
      <div className={classes.spaceTop}>
        <Button
          variant="contained"
          color="primary"
          className={classes.secondary}
        >
          <Link to={patientLink} style={{ textDecoration: 'none', color: "#fff" }}>View Dashboard</Link>
        </Button>
      </div>
    )
  }
}

export default withStyles(styles)(ButtonBar);
