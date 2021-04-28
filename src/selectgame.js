import React from 'react';

class SelectGame extends React.Component {
    generateName() {
        var prefixes = [
            "Green",
            "Yellow",
            "Red",
            "Purple",
            "Blue",
            "Orange"
        ]
        var suffixes = [
            "I-Piece",
            "O-Piece",
            "T-Piece",
            "J-Piece",
            "L-Piece",
            "S-Piece",
            "Z-Piece"
        ]

        return prefixes[Math.floor(Math.random() * prefixes.length)] + " " + suffixes[Math.floor(Math.random() * suffixes.length)];
    }

    constructor(props) {
        super(props);
        this.state = {
            name: this.generateName(),
            game_code: ""
        };
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

    render() {
        return (

            <div className="connect">
                <h2>Select a username:</h2>
                <input type="text" className="form-control" onChange={this.handleNameChanged.bind(this)} value={this.state.name} />
                <h2>Create a new game</h2>
                <button onClick={(e) => this.props.onCreateGame(this.state.name)} className="btn btn-lg btn-secondary">Create</button>
                <hr />
                <h2>Or join an existing game:</h2>
                <form>
                    <div className="form-group">
                        <input type="text" className="form-control" onChange={this.handleGameCodeChanged.bind(this)} value={this.state.game_code} placeholder="ABCDEF" />
                    </div>
                </form>
                <button onClick={(e) => this.onJoinGame(this.state.name, this.state.game_code)} className="btn btn-lg btn-secondary">Join</button>
            </div>
        )
    }
}

export { SelectGame };
