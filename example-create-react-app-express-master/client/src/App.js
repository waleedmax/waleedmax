import React, { Component } from 'react';
//import {Router, Route, BrowserHistory} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 500,
    height: 450,
    overflowY: 'auto',
  },
  image: {
    width: 200
  }
};

class App extends Component {

  state = {
    response: []
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/items');//await used for waiting the data same then
    const body =  await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <MuiThemeProvider>
      <div className="App">

        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Waleed Page For API</h1>
        </header>

        <div style={styles.root}>
            <GridList
              cellHeight={180}
              style={styles.gridList}
            >
              <Subheader>Menu items</Subheader>
              {this.state.response.map((item, i) => (

                <GridTile
                  key={item[i]}
                  title={item[i].item_price}
                  subtitle={<span>type<b>{item[i].item_description}</b></span>}
                  actionIcon={<IconButton><StarBorder color="gold" /></IconButton>}
                >
                <img src={item[4].menu_item_pic} style={styles.image}/>
               </GridTile>
              ))}
            </GridList>
          </div>
          </div>



    </MuiThemeProvider>
    );
  }
}

export default App;
