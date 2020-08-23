import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import axios from 'axios';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

const useStyles = makeStyles((theme) => ({
  root: {
    // width: '100%',
    maxWidth: 300,
    minWidth:245,
    backgroundColor: theme.palette.background.paper,
    // position: 'relative',
    overflow: 'auto',
    maxHeight: 300,
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
}));

export default function WinnersList({ afterChangeRecordsList, setRecordsUpdated, recordsUpdated }) {
  const classes = useStyles();
  if (afterChangeRecordsList.length === 0) {
      return (<div></div>)
  }
  return (
    <List className={classes.root}>  
     <h1>Winner List</h1>
     <button onClick={async () => { await axios.delete('/api/v1/records'); setRecordsUpdated(!recordsUpdated) }} >Delete Winners List</button>
            {
            afterChangeRecordsList.map((winner, i) => (
              <ListItem key={i}>
                 
                  <ul>
                <li>{`Id: ${winner.id}`}</li>
                <li>{`Name: ${winner.winnerName}`}</li>
                <li>{`Date: ${winner.date}`}</li>
                <li>{`GameDuration: ${winner.gameDuration}`}</li>
                </ul>
              </ListItem>
            ))
            }
    </List>
  );
}