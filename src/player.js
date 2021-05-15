import React from 'react';

class Player extends React.Component {
    // Needs to be in sync with server
    STATE_ALIVE = 0;
    STATE_DEAD = 1;
    STATE_WINNER = 2;

    render() {
        if (this.props.user.state === this.STATE_ALIVE) {
            return (
                <div className="col-3">
                    <img src={process.env.PUBLIC_URL + '/images/animation.gif'} className="gameboy" />
                    <p><b>{this.props.user.name}</b><br/>
                    Height: {this.props.user.level}</p>
                </div>
            );
        } else if (this.props.user.state === this.STATE_DEAD) {
            return (
                <div className="col-3">
                    <img src={process.env.PUBLIC_URL + '/images/dead.png'} className="gameboy" />
                    <p><b>{this.props.user.name}</b><br/>
                    Game Over</p>
                </div>
            );
        } else if (this.props.user.state === this.STATE_WINNER) {
            return (
                <div className="col-3">
                    <img src={process.env.PUBLIC_URL + '/images/win.png'} className="gameboy" />
                    <p><b>{this.props.user.name}</b><br/>
                    Winner!!!</p>
                </div>
            );
        }
    }
}

export { Player };
