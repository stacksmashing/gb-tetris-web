import React from 'react';

import {Player} from './player.js';

class Lobby extends React.Component {
    render() {
        var userbar;
        if(this.props.admin) {
            userbar = <button onClick={(e) => this.props.onStartGame()} className="btn btn-lg btn-secondary">Start game!</button>
        } else {
            userbar = <p>Please wait for the lobby leader to start the game!</p>
        }

        return (
            <div>
                <h2>In Lobby: {this.props.game_code}</h2>
                <h4>Players:</h4>
                <div className="container">
                    <div className="row justify-content-center">
                            {this.props.users.map((user, index) => (
                                <Player key="lobby-{user.name}" user={user} />
                        ))}
                    </div>
                </div>
                {userbar}
            </div>
        )
    }
}

export { Lobby };
