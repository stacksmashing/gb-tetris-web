import React from 'react';
import ReactDOM from 'react-dom';


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap/dist/js/bootstrap.bundle'
import './index.css';

import { Serial } from './serial.js';

global.jQuery = require('jquery');
require('bootstrap');

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
      xIsNext: true,
    };
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext,
    });
  }

  renderSquare(i) {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  render() {
    const status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}


class OnlineTetris extends React.Component {
  SONG_A   = "1C"
  SONG_B   = "1D"
  SONG_C   = "1E"
  SONG_OFF = "1F"

  StatusConnect = "Connect"; // Select USB device
  StatusConnecting = "Connecting"; // Connect to USB device
  StatusConnectingTetris = "ConnectingTetris"; // Attempt to connect to tetris
  StatusSelectMusic = "SelectMusic";
  StatusSelectHandicap = "SelectHandicap";
  StatusInGame = "InGame";

  constructor(props) {
    super(props);
    this.state = {
      status: this.StatusConnect,
      music: this.SONG_A
    }
  }

  handleConnectClick() {
    this.serial = new Serial();
    this.setState({
      status: this.StatusConnecting
    });
    this.serial.getDevice().then(() => {
      console.log("Usb connected, updating status.");
      this.setState({
        // status: this.StatusSelectMode
        status: this.StatusConnectingTetris
        
      });
      this.attemptTetrisConnection();
    }).catch(c => {
      console.log("CATTTCH");
      this.setState({
        status: this.StatusConnect
      });
    });
  }

  timeoutFoo() {
    setTimeout(() => {
      this.serial.sendHex(this.state.music);
      this.serial.read(64);
      this.timeoutFoo();
    }, 100);
  }

  attemptTetrisConnection() {
    console.log("Attempt connection...");
    this.serial.sendHex("29");
    this.serial.readHex(64).then(result => {
      if(result === "55") {
        console.log("SUCCESS!\n");

        this.setState({
          status: this.StatusSelectMusic
        });
        this.timeoutFoo();
        
      } else {
        console.log("Fail");
        setTimeout(() => {
      
          this.attemptTetrisConnection();
        }, 100);
      }
    },
    error => {
      console.log("ERROR");
      console.log(error);
    });
  }

  handleSendClick() {
    // this.serial = new Serial();
    // this.serial.getDevice();
    this.serial.sendHex("29");
    this.serial.readString();
    this.timeoutFoo();
  }

  setMusic(music) {
    this.setState({
      music: music
    });
  }

  render() {
    if (navigator.usb) {
      if (this.state.status === this.StatusConnect) {
        return (

          <div className="connect">

            <h1 className="cover-heading">Game Boy Tetris Online</h1>

            <p className="lead">Connect your Game Boy, boot Tetris, and start playing with your friends!</p>
            <hr />
            <h3>Connect your Game Boy</h3>
            <p>Connect your Game Boy with the USB to Game Link adapter and click "connect".</p>
            <button onClick={(e) => this.handleConnectClick()} className="btn btn-lg btn-secondary">Connect</button>
          </div>
        )
      } else if (this.state.status === this.StatusConnecting) {
        return (
          <div className="connect">
            <h2>Connecting...</h2>
          </div>
        )

      } else if (this.state.status === this.StatusConnectingTetris) {
        return (
          <div className="connect">
            <h2>Connecting to Tetris...</h2>
            <p>Ensure your Game Boy is turned on and in the Tetris main menu.</p>
          </div>
        )

      } else if (this.state.status === this.StatusSelectMusic) {
        return (
          <div className="connect">
            <h2>Connection established!</h2>
            <h4>Choose your tunes:</h4>

            <button onClick={(e) => this.setMusic(this.SONG_A)} className="musicButton btn btn-lg btn-secondary">MUSIC A</button>
            <button onClick={(e) => this.setMusic(this.SONG_B)} className="musicButton btn btn-lg btn-secondary">MUSIC B</button><br/>
            <hr/>
            <button onClick={(e) => this.setMusic(this.SONG_C)} className="musicButton btn btn-lg btn-secondary">MUSIC C</button>
            <button onClick={(e) => this.setMusic(this.SONG_OFF)} className="musicButton btn btn-lg btn-secondary">MUSIC OFF</button><br/>
            <p>(Though obviously A is the best...)</p>
            <br/>
            <button onClick={(e) => this.handleSendClick()} className="btn btn-lg btn-secondary">Send</button>
          </div>
        )
      }
    } else {
      return (
        <h2>Sorry, your browser does not support WebUSB!</h2>
      )
    }
  }
}



class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <OnlineTetris />,
  document.getElementById('root')
);
