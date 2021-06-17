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
            name: localStorage.getItem('name') || this.generateName(),
            game_code: "",
            options: {
                randomtype: localStorage.getItem('options.randomtype') ||"classic"
            }
        };
    }

    handleNameChanged(event) {
        localStorage.setItem('name', event.target.value);
        this.setState({
            name: event.target.value
        })
    }


    handleGameRandomisationChanged(value) {
        return (event) => {
            localStorage.setItem('options.randomtype', value);
            this.setState({
                options: {
                    ...this.state.options,
                    randomtype: value
                }
            })
        }
    }
    isClassicRandomisation() {
        return this.state.options.randomtype == 'classic';
    }
    isModernRandomisation() {
        return this.state.options.randomtype == 'modern';
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
                <input type="text" className="form-control username-input" onChange={this.handleNameChanged.bind(this)} value={this.state.name} />
                <hr/>
                <div className="container">
                    <div className="row">
                        <div className="col-6">
                            <div className="card custom-card">
                                <div className="card-body">
                                    <div className="card-title">
                                        <h4>Create game</h4>
                                    </div>
                                    <div className="card-text">
                                        <div className="card-options">
                                            <h6>Randomisation:</h6>
                                            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                                <label className={`btn btn-dark ${ this.isClassicRandomisation() ? 'active' : '' }`}>
                                                    <input type="radio" name="randomisation" id="random-classic" autoComplete="off" checked={this.isClassicRandomisation()} onChange={this.handleGameRandomisationChanged("classic")}/> Classic
                                                </label>
                                                <label className={`btn btn-dark ${ this.isModernRandomisation() ? 'active' : '' }`}>
                                                    <input type="radio" name="randomisation" id="random-modern" autoComplete="off" checked={this.isModernRandomisation()} onChange={this.handleGameRandomisationChanged("modern")}/> Modern
                                                </label>
                                            </div>
                                        </div>
                                        <button onClick={(e) => this.props.onCreateGame(this.state.name, this.state.options)} className="btn btn-lg btn-secondary game-create-button">Create</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="card custom-card">
                                <div className="card-body">
                                    <div className="card-title">
                                        <h4>Join game</h4>
                                    </div>
                                    <div className="card-text">
                                    <input type="text" className="form-control game-code-input" onChange={this.handleGameCodeChanged.bind(this)} value={this.state.game_code} placeholder="ABCDEF" />
                                        <button onClick={(e) => this.props.onJoinGame(this.state.name, this.state.game_code)} className="btn btn-lg btn-secondary">Join</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
            </div>
        )
    }
}

export { SelectGame };
