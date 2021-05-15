import React from 'react';

import {Player} from './player.js';

class Lobby extends React.Component {
    render() {
        let userBar;
        if (this.props.admin) {
            userBar = <button onClick={this.props.onStartGame} className="btn btn-lg btn-secondary">Start game!</button>;
        } else {
            userBar = <p>Please wait for the lobby leader to start the game!</p>;
        }

        return (
            <div>
                <h2>In Lobby: {this.props.game_code}</h2>
                <h4>Players:</h4>
                <div className="container">
                    <div className="row justify-content-center">
                        {this.props.users.map((user) => (
                            <Player key={`lobby-${user.name}`} user={user} />
                        ))}
                    </div>
                </div>
                {userBar}
            </div>
        );
    }
}

export { Lobby };
