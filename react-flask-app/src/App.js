import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

// Material
import Button from '@material-ui/core/Button';
import Bookmarks from '@material-ui/icons/Bookmarks';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

import Topbar from './TopBar.js';
import Patients from './Patients.js';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch
} from "react-router-dom";
import { pink, blue } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: pink,
    secondary: blue,
  }
});

export default function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Router>
      <Topbar currentPath={"/"} />

      <div>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/patients">
            <Patients theme={theme}/>
          </Route>
        </Switch>
      </div>

    </Router>
    </MuiThemeProvider>
  );
}

function Home() {
  return (
    <p>nyammaz</p>
  );
}
