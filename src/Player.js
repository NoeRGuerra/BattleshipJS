const Gameboard = require('./Gameboard');

class Player {
    constructor(type, width = 10, height = 10) {
        this.type = type; // "real" or "computer"
        this.gameboard = new Gameboard(width, height);
    }

    set type(value) {
        if (value != "real" && value != "computer") {
            throw new Error(`${value} is invalid. Type must be "real" or "computer"`);
        }
        this._type = value;
    }

    get type() {
        return this._type;
    }
}

module.exports = Player;