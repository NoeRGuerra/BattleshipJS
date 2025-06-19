const Gameboard = require("./Gameboard");

class Player {
  constructor(type, width = 10, height = 10) {
    this.type = type; // "real" or "computer"
    this.gameboard = new Gameboard(width, height);
  }

  makeRandomAttack(opponentGameboard) {
    if (this.type != "computer") {
      return;
    }
    let row = Math.floor(Math.random() * opponentGameboard.size[0]);
    let column = Math.floor(Math.random() * opponentGameboard.size[1]);
    let isAttackValid = false;
    let attackResult;
    const MAX_ATTEMPTS =
      opponentGameboard.size[0] * opponentGameboard.size[1] * 2;
    let attempts = 0;
    while (!isAttackValid) {
      attackResult = opponentGameboard.receiveAttack([row, column]);
      if (
        attackResult === "miss" ||
        attackResult === "hit" ||
        attackResult === "sunk"
      ) {
        isAttackValid = true;
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        return "Max attempts reached";
      }
      row = Math.floor(Math.random() * opponentGameboard.size[0]);
      column = Math.floor(Math.random() * opponentGameboard.size[1]);
    }
    return attackResult;
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
