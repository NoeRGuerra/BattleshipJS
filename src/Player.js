const Gameboard = require("./Gameboard");

class Player {
  constructor(type, width = 10, height = 10) {
    this.type = type; // "real" or "computer"
    this.gameboard = new Gameboard(width, height);

    if (this.type === "computer") {
      this.attackMode = "hunt";
      this.targetQueue = [];
      this.potentialTargets = [];
    }
  }

  makeAttack(opponentGameboard) {
    if (this.type !== "computer") {
      return;
    }

    if (this.potentialTargets.length === 0 && this.targetQueue.length > 0) {
      this.rebuildTargets(opponentGameboard);
    }
    if (this.potentialTargets.length > 0) {
      this.attackMode = "target";
      return this.targetAttack(opponentGameboard);
    } else {
      this.attackMode = "hunt";
      return this.huntAttack(opponentGameboard);
    }
  }

  huntAttack(opponentGameboard) {
    let row, column, attackResult;
    let isAttackValid = false;
    const MAX_ATTEMPTS = opponentGameboard.size[0] * opponentGameboard.size[1];
    let attempts = 0;

    while (!isAttackValid && attempts < MAX_ATTEMPTS) {
      row = Math.floor(Math.random() * opponentGameboard.size[1]);
      column = Math.floor(Math.random() * opponentGameboard.size[0]);

      if (!opponentGameboard.isAlreadyAttacked([row, column])) {
        attackResult = opponentGameboard.receiveAttack([row, column]);
        isAttackValid = true;
      }

      attempts += 1;
    }

    if (attempts >= MAX_ATTEMPTS) {
      return "Max attempts reached";
    }

    if (attackResult === "hit") {
      this.attackMode = "target";
      this.targetQueue.push([row, column]);
      this.getPotentialTargets([row, column], opponentGameboard);
    }

    return attackResult;
  }

  targetAttack(opponentGameboard) {
    const [row, column] = this.potentialTargets.pop();

    const attackResult = opponentGameboard.receiveAttack([row, column]);

    if (attackResult === "hit") {
      this.targetQueue.push([row, column]);
      this.refineTargets(opponentGameboard);
    } else if (attackResult === "sunk") {
      this.attackMode = "hunt";
      this.targetQueue = [];
      this.potentialTargets = [];
    }

    return attackResult;
  }

  rebuildTargets(opponentGameboard) {
    this.potentialTargets = [];
    for (const hit of this.targetQueue) {
      const [row, col] = hit;
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];
      for (const neighbor of neighbors) {
        this.addPotentialTarget(neighbor[0], neighbor[1], opponentGameboard);
      }
    }
  }

  addPotentialTarget(row, col, opponentGameboard) {
    if (
      row >= 0 &&
      row < opponentGameboard.size[1] &&
      col >= 0 &&
      col < opponentGameboard.size[0] &&
      !opponentGameboard.isAlreadyAttacked([row, col]) &&
      !this.potentialTargets.some((p) => p[0] === row && p[1] === col)
    ) {
      this.potentialTargets.push([row, col]);
    }
  }

  getPotentialTargets(coords, opponentGameboard) {
    const [row, col] = coords;
    this.potentialTargets = [];
    this.addPotentialTarget(row - 1, col, opponentGameboard); // Up
    this.addPotentialTarget(row + 1, col, opponentGameboard); // Down
    this.addPotentialTarget(row, col - 1, opponentGameboard); // Left
    this.addPotentialTarget(row, col + 1, opponentGameboard); // Right
  }

  refineTargets(opponentGameboard) {
    this.potentialTargets = [];
    const firstHit = this.targetQueue[0];
    const lastHit = this.targetQueue[this.targetQueue.length - 1];

    const isHorizontal = firstHit[0] === lastHit[0];
    const isVertical = firstHit[1] === lastHit[1];

    if (isHorizontal) {
      const row = firstHit[0];
      const minCol = Math.min(...this.targetQueue.map((h) => h[1]));
      const maxCol = Math.max(...this.targetQueue.map((h) => h[1]));
      this.addPotentialTarget(row, minCol - 1, opponentGameboard);
      this.addPotentialTarget(row, maxCol + 1, opponentGameboard);
    } else if (isVertical) {
      const col = firstHit[1];
      const minRow = Math.min(...this.targetQueue.map((h) => h[0]));
      const maxRow = Math.max(...this.targetQueue.map((h) => h[0]));
      this.addPotentialTarget(minRow - 1, col, opponentGameboard);
      this.addPotentialTarget(maxRow + 1, col, opponentGameboard);
    }
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
