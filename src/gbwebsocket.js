const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

class GBWebsocket {
    // Needs to be in sync with server!!!
    GAME_STATE_FINISHED = 2
    GAME_STATE_ERROR = 9998

    constructor(url, name) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => {
            console.log(this);
            this.onMessage(event);
        };

        this.onconnected = () => console.log("On connected not implemented")

        this.oninfoupdate = () => console.log("On info update not implemented!")

        this.ongamestart = () => console.log("On game start not implemented!")

        this.ongameupdate = () => console.log("Game update not implemented!")

        this.ongameend = () => console.log("Game end not implemented!")

        this.onuserinfo = () => console.log("User info not implemented!")

        this.onlines = () => console.log("Lines not implemented!")

        this.onwin = () => console.log("Win not implemented!")

        this.admin = false;
        this.name = name;
        this.game_name = "YOU SHOULD NEVER SEE THIS"; // famous last words
        this.users = []
        this.uuid = ""
        this.waitForConnection();
    }

    sendRegisterMessage() {
        this.ws.send(JSON.stringify({
            "type": "register",
            "name": this.name
        }));
    }

    waitForConnection() {
        if(this.ws.readyState === 1) {
            console.log("Connection ready")
            // Send register message and alert state
            this.sendRegisterMessage();
            this.onconnected(this);
        } else {
            setTimeout(
                this.waitForConnection.bind(this),
                100
            );
        }
    }

    sendLines(lines) {
        this.ws.send(JSON.stringify({
            "type": "lines",
            "lines": lines
        }));
    }

    sendLevel(level) {
        this.ws.send(JSON.stringify({
            "type": "update",
            "level": level
        }));
    }

    sendStart() {
        this.ws.send(JSON.stringify({
            "type": "start"
        }))
    }

    sendDead() {
        this.ws.send(JSON.stringify({
            "type": "dead"
        }))
    }

    static initiateGame(name) {
        const gb = new GBWebsocket("wss://server.tetris.stacksmashing.net:5678/create", name);
        gb.admin = true;
        return gb;
    }

    static joinGame(name, code) {
        return new GBWebsocket("wss://server.tetris.stacksmashing.net:5678/join/" + code, name)
    }

    onMessage(event) {
        console.log("onMessage");
        console.log(event);
        console.log("Parsed message:");
        const message = JSON.parse(event.data);
        console.log(message);

        switch(message.type) {
            case "game_info":
                console.log("New game info");
                this.game_name = message.name;
                this.users = message.users;
                this.oninfoupdate(this);
                break;
            case "user_info":
                this.uuid = message.uuid;
                this.onuserinfo(this);
                break;
            case "start_game":
                console.log("Game starting!");
                console.log("Tiles:")
                console.log(message.tiles);
                this.tiles = fromHexString(String(message.tiles));
                this.ongamestart(this);
                break;
            case "game_update":
                console.log("Game update!");
                this.ongameupdate(this);
                break;
            case "error":
                console.log("Error!")
                this.state = this.GAME_STATE_ERROR;
                this.ongameupdate(this);
                break;
            case "end":
                console.log("End!")
                this.state = this.GAME_STATE_FINISHED;
                this.ongameend(this);
                break;
            case "lines":
                console.log("Lines")
                this.onlines(this, message.lines);
                break;
            case "win":
                console.log("Lines")
                this.onwin(this);
                break;
            default:
                console.log("Unknown message");
                console.log(message);
                break;
        }
    }
}

export { GBWebsocket };
