import React from 'react';

import {Player} from './player.js';

class InGame extends React.Component {
    render() {
        return (
            <div>
                <h2>In Game: {this.props.game_code}</h2>
                <div className="container">
                    <div className="row justify-content-center">
                        {this.props.users.map((user) => (
                            <Player key={`lobby-${user.name}`} user={user} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export { InGame };
