import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  table: {
    minWidth: 300,
  },
});

function createData(word, start_time, num_reps) {
  let q = Math.floor(start_time / 60);
  let remainder = start_time % 60;
  start_time = q.toLocaleString() + "m" + remainder.toLocaleString() + "s";

  return { word, start_time, num_reps };
}


export default function DenseTable(props) {
  const wr = props.wr
  const classes = useStyles();

  const allKeys = Object.keys(wr).sort();
  const rows = [];

  allKeys.forEach(k => {
    let word = wr[k].word
    let start_time = wr[k].start_time
    let num_reps = wr[k].num_reps

    rows.push(createData(word, start_time, num_reps));
  });

  return (
    rows.length == 0 ? (
      <Typography variant="subtitle1" gutterBottom>
        There were no repetitions.
      </Typography>
    ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Word</TableCell>
                <TableCell align="right">Start Time</TableCell>
                <TableCell align="right">Repetitions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.word}>
                  <TableCell component="th" scope="row">
                    {row.word}
                  </TableCell>
                  <TableCell align="right">{row.start_time}</TableCell>
                  <TableCell align="right">{row.num_reps}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
    )
  );
}
