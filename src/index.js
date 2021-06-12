import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Serial from './Serial';
import GBWebsocket from './GBWebsocket';
import Lobby from './Lobby';
import SelectGame from './SelectGame';
import InGame from './InGame';

class OnlineTetris extends React.Component {
    SONG_A   = "1C"
    SONG_B   = "1D"
    SONG_C   = "1E"
    SONG_OFF = "1F"

    StateConnect = "Connect"; // Select USB device
    StateConnecting = "Connecting"; // Connect to USB device
    StateConnectingTetris = "ConnectingTetris"; // Attempt to connect to tetris
    StateSelectMusic = "SelectMusic";
    StateSelectHandicap = "SelectHandicap";
    StateJoiningGame = "JoiningGame";
    StateLobby = "Lobby";
    StateStartingGame = "StartingGame";
    StateJoinGame = "SelectJoinGame";
    StateInGame = "InGame";
    StateFinished = "StateFinished";

    constructor(props) {
        super(props);
        this.state = {
            state: this.StateConnect,
            music: this.SONG_A,
            name: "Foo",
            game_code: "",
            users: [],
            level: 0,
            difficulty: 0,
            uuid: "",
            admin: false
        };
    }

    async handleConnectClick() {
        this.serial = new Serial();
        this.setState({
            state: this.StateConnecting
        });
        try {
            await this.serial.getDevice();
            console.log("Usb connected, updating status.");
            this.setState({
                state: this.StateConnectingTetris
            });
            this.attemptTetrisConnection();

        } catch (e) {
            console.error(e);
            this.setState({
                state: this.StateConnect
            });
        }
    }

    updateLevel(level) {
        if (this.state.level !== level) {
            console.log("Level increased!");
            console.log(level);
            this.setState({
                level: level
            });
            this.gb.sendLevel(level);
        }
    }

    // This timer will run as soon as the music selection is started.
    // It will stop automatically when our state is not 'select music' anymore.
    startMusicTimer() {
        setTimeout(() => {
            console.log("Sending music")
            if (this.state.state === this.StateSelectMusic) {
                console.log("Music sent")
                this.serial.sendHex(this.state.music);
                this.serial.read(64);
                this.startMusicTimer();
            } else {
                console.log("invalid state")
            }
        }, 100);
    }

    // Same as startMusicTimer, but will send a fake difficulty constantly and read it back.
    startHandicapTimer() {
        setTimeout(() => {
            console.log("Handicap timer");
            if (this.state.state === this.StateSelectHandicap) {
                console.log("Sending handicap");
                // Just send a fake handicap
                this.serial.sendHex("00");
                const selectedDifficulty = this.serial.read(1)[0];
                console.log("Selected difficulty:");
                console.log(selectedDifficulty);
                this.setState({
                    difficulty: selectedDifficulty
                })
                this.startHandicapTimer();
            } else {
                console.log("Invalid state, stopping handicap timer.");
            }
        }, 100);
    }

    startGameTimer() {
        setTimeout(async () => {
            this.serial.bufSendHex("02", 10); // fixed level
            const result = await this.serial.read(64);
            const data = result.data.buffer;
            if (data.length > 1) {
                console.log("Data too long");
                console.log(data.length);
                // We ignore if we still have old data in the buffer.
                this.startGameTimer();
            } else {
                const value = new Uint8Array(data)[0];
                if (value < 20) {
                    this.updateLevel(value);
                } else if ((value >= 0x80) && (value <= 0x85)) { // lines sent
                    console.log("Sending lines!");
                    this.gb.sendLines(0x83);
                } else if (value === 0xaa) { // we lost...
                    this.setState({
                        state: this.StateFinished
                    });
                    this.gb.sendDead();
                } else if (value === 0xFF) { //screen is filled after loss
                    this.serial.bufSendHex("43", 10);
                }

            }
            this.startGameTimer();
        }, 100);
    }

    async attemptTetrisConnection() {
        console.log("Attempt connection...");
        this.serial.sendHex("29");
        try {
            const result = await this.serial.readHex(64);
            if(result === "55") {
                console.log("SUCCESS!\n");

                this.setState({
                    state: this.StateSelectMusic
                });
                this.startMusicTimer();
            } else {
                console.log("Fail");
                setTimeout(() => {
                    this.attemptTetrisConnection();
                }, 100);
            }
        } catch (error) {
            console.error("ERROR");
            console.error(error);
        }
    }

    handleMusicSelected() {
        this.serial.sendHex("50");
        this.serial.read(64);
        this.setState({
            state: this.StateSelectHandicap
        });
    }

    handleHandicapSelected() {
        this.serial.sendHex()
    }

    handleCreateGame(name) {
        console.log("Create new game");
        console.log(name);
        this.setState({
            state: this.StateJoiningGame,
            admin: true,
            name: name
        })
        this.gb = GBWebsocket.initiateGame(name);
        this.setGbCallbacks();
    }

    handleJoinGame(name, game_code) {
        console.log("Join game");
        console.log(name);
        console.log(game_code);
        this.setState({
            state: this.StateJoiningGame,
            admin: false,
            name: name,
            game_code: game_code
        })
        this.gb = GBWebsocket.joinGame(name, game_code);
        this.setGbCallbacks();
    }

    setGbCallbacks() {
        this.gb.onconnected = this.gbConnected.bind(this);
        this.gb.oninfoupdate = this.gbInfoUpdate.bind(this);
        this.gb.ongamestart = this.gbGameStart.bind(this);
        this.gb.ongameupdate = this.gbGameUpdate.bind(this);
        this.gb.ongameend = this.gbGameEnd.bind(this);
        this.gb.onuserinfo = this.gbUserInfo.bind(this);
        this.gb.onlines = this.gbLines.bind(this);
        this.gb.onwin = this.gbWin.bind(this);
    }

    testCreate() {
        console.log("testing websocket");
        this.gb = GBWebsocket.initiateGame(this.state.name);
        this.setGbCallbacks();
        this.setState({
            admin: true
        });
    }

    testJoin() {
        console.log("testing websocket");
        this.gb = GBWebsocket.joinGame(this.state.name, this.state.game_code);
        this.setGbCallbacks();
        this.setState({
            admin: false
        });
    }

    testUpdate() {
        const level = this.state.level + 1;
        this.setState({
            level: level
        });
        this.gb.sendLevel(level);
    }

    testStart() {
        this.gb.sendStart();
    }

    gbConnected(gb) {
        console.log("We're connected!");
        console.log(gb.users);
        this.setState({
            game_code: gb.game_name,
            users: gb.users,
            state: this.StateLobby
        });
    }

    gbGameStart(gb) {
        console.log(this);
        console.log("Got game start.");

        // step 1: start game message
        this.serial.bufSendHex("60", 150);
        // step 2: Send master indication
        this.serial.bufSendHex("29", 4);

        console.log("Sending unknown bytes");
        // step 3: send 100 unknown bytes
        for (let i = 0; i < 100; i++) {
            this.serial.bufSendHex("83", 4);
        }

        // step 4: send master again
        this.serial.bufSendHex("29", 8);
        console.log("Sending tiles");
        // step 5: send tiles
        for (let i = 0; i < gb.tiles.length; i++) {
            this.serial.bufSend(new Uint8Array([gb.tiles[i]]), 4);
        }

        // step 6: and go
        this.serial.bufSendHex("30", 70);
        this.serial.bufSendHex("00", 70);
        this.serial.bufSendHex("02", 70);
        this.serial.bufSendHex("02", 70);
        this.serial.bufSendHex("20", 70);

        // Wait 3 seconds and then start game
        setTimeout(() => {
            this.setState({
                state: this.StateInGame
            });
            this.startGameTimer();
        }, 2000)

    }

    gbGameUpdate() {
        console.log("game update");
    }

    gbGameEnd() {
        console.log("game end");
    }

    gbUserInfo(gb) {
        console.log("userinfo");
        this.setState({
            uuid: gb.uuid
        })
    }

    gbInfoUpdate(gb) {
        console.log(this);
        console.log("Got game update.")
        console.log(gb.users)
        this.setState({
            game_code: gb.game_name,
            users: gb.users
        });
    }

    gbLines(gb, lines) {
        console.log("lines");
        this.serial.bufSend(new Uint8Array([lines]), 10);
    }

    gbWin() {
        console.log("WIN!");
        this.serial.bufSendHex("AA", 50); // aa indicates BAR FULL
        this.serial.bufSendHex("02", 50); // ffffinish
        this.serial.bufSendHex("02", 50); // ffffinish
        this.serial.bufSendHex("02", 50); // ffffinish
        this.serial.bufSendHex("43", 50); // go to final screen. nice.
    }

    setMusic(music) {
        this.setState({
            music: music
        });
    }

    handleNameChanged(event) {
        this.setState({
            name: event.target.value
        })
    }

    handleGameCodeChanged(event) {
        this.setState({
            game_code: event.target.value
        })
    }

    handleStartGame() {
        console.log("Starting game!");
        this.gb.sendStart();
        this.setState({
            state: this.StateStartingGame
        });
    }

    render() {
        if (navigator.usb) {
            if (this.state.state === this.StateConnect) {
                return (
                    <div className="connect">
                        <img src={process.env.PUBLIC_URL + '/images/animation.gif'} className="gameboy" />
                        <h2 className="cover-heading">Tetrilink</h2>
                        <p className="lead">Connect your Game Boy, boot Tetris, and start playing with your friends!</p>
                        <hr />
                        <h4>Connect your Game Boy</h4>
                        <p>Connect your Game Boy with the USB to Game Link adapter and click "connect".</p>
                        <button onClick={() => this.handleConnectClick()} className="btn btn-lg btn-secondary">Connect</button>
                        <br/>
                        <small>Version: 0.2</small>
                    </div>
                );
            } else if (this.state.state === this.StateConnecting) {
                return (
                    <div className="connect">
                        <h2>Connecting...</h2>
                    </div>
                );
            } else if (this.state.state === this.StateConnectingTetris) {
                return (
                    <div className="connect">
                        <h2>Connecting to Tetris...</h2>
                        <p>Ensure your Game Boy is turned on and in the Tetris main menu.</p>
                    </div>
                );
            } else if (this.state.state === this.StateSelectMusic) {
                return (
                    <div className="connect">
                        <h2>Connection established!</h2>
                        <h4>Choose your tunes:</h4>

                        <button onClick={() => this.setMusic(this.SONG_A)} className="musicButton btn btn-lg btn-secondary">MUSIC A</button>
                        <button onClick={() => this.setMusic(this.SONG_B)} className="musicButton btn btn-lg btn-secondary">MUSIC B</button><br/>
                        <hr/>
                        <button onClick={() => this.setMusic(this.SONG_C)} className="musicButton btn btn-lg btn-secondary">MUSIC C</button>
                        <button onClick={() => this.setMusic(this.SONG_OFF)} className="musicButton btn btn-lg btn-secondary">MUSIC OFF</button><br/>
                        <p>(Though obviously A is the best...)</p>
                        <br/>
                        <button onClick={() => this.handleMusicSelected()} className="btn btn-lg btn-secondary">Next</button>
                    </div>
                );
            } else if (this.state.state === this.StateSelectHandicap) {
                return (
                    <div className="connect">
                        <SelectGame onCreateGame={(name) => this.handleCreateGame(name)} onJoinGame={(name, code) => this.handleJoinGame(name, code)} />
                    </div>
                );
            } else if (this.state.state === this.StateJoiningGame) {
                return (
                    <div className="connect">
                        <h2>Connecting to game server...</h2>
                    </div>
                );
            } else if (this.state.state === this.StateLobby) {
                return (
                    <div className="connect">
                        <Lobby game_code={this.state.game_code} users={this.state.users} admin={this.state.admin} onStartGame={() => this.handleStartGame()} />
                    </div>
                );
            } else if (this.state.state === this.StateStartingGame) {
                return (
                    <div className="connect">
                        <h2>Starting game...</h2>
                    </div>
                );
            } else if (this.state.state === this.StateInGame) {
                return (
                    <div className="connect">
                        <InGame game_code={this.state.game_code} users={this.state.users} admin={this.state.admin} />
                    </div>
                );
            } else if (this.state.state === this.StateJoinGame) {
                return (
                    <div className="connect">
                        <h2>Select a username</h2>
                        <input type="text" onChange={this.handleNameChanged.bind(this)} value={this.state.name} />
                        <hr/>
                        <h3>Join a game? Enter the game code here:</h3>
                        <input type="text" onChange={this.handleGameCodeChanged.bind(this)} value={this.state.game_code} placeholder="Game code"/>
                        <button onClick={this.testJoin.bind(this)} className="btn btn-lg btn-secondary">Join game</button>
                        <hr/>
                        <button onClick={this.testCreate.bind(this)} className="btn btn-lg btn-secondary">Create new game</button>
                    </div>
                );
            } else if (this.state.state === this.StateFinished) {
                return (
                    <div className="connect">
                        <InGame game_code={this.state.game_code} users={this.state.users} admin={this.state.admin} uuid={this.state.uuid} />
                        <h2>Game finished!</h2>
                    </div>
                );
            }
            return (<div>Invalid state {this.state.state}</div>)
        }
        return (<h2>Sorry, your browser does not support WebUSB!</h2>);
    }
}

// ========================================

ReactDOM.render(
    <OnlineTetris />,
    document.getElementById('root')
);
