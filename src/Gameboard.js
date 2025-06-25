const { FLEET_DEFINITIONS } = require("./gameConfig");
const Ship = require("./Ship");

class Gameboard {
  constructor(width, height) {
    this.size = [width, height];
    this.board = this.createBoard(this.size);
    this.ships = [];
    this.attackedCoordinates = [];
    this.missedAttacks = [];
  }

  placeShip(coordinates, orientation, length) {
    const ship = new Ship(length);
    const [row, column] = coordinates;
    if (typeof length !== "number" || Number.isInteger(length) === false) {
      return "invalid_length_type";
    }
    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2 ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      return "invalid_coordinates";
    }
    if (
      typeof orientation !== "string" ||
      !["horizontal", "vertical"].includes(orientation)
    ) {
      return "invalid_orientation";
    }
    if (
      (orientation === "horizontal" && length > this.size[0]) ||
      (orientation === "vertical" && length > this.size[1]) ||
      length < 1
    ) {
      // Check if ship is bigger than map
      return "invalid_length";
    }
    if (
      row < 0 ||
      row > this.size[1] - 1 ||
      column < 0 ||
      column > this.size[0] - 1
    ) {
      // Check if coordinates are outside map bounds
      return "out_of_bounds";
    }
    if (
      (orientation === "horizontal" &&
        coordinates[1] + length > this.size[0]) ||
      (orientation === "vertical" && coordinates[0] + length > this.size[1])
    ) {
      // Check if ship fits in the map at current coordinates
      return "does_not_fit";
    }
    if (!this.checkCoordinates(coordinates, length, orientation)) {
      return "overlap";
    }

    if (orientation === "horizontal") {
      for (let i = 0; i < length; i += 1) {
        this.board[row][column + i] = ship;
      }
    } else if (orientation === "vertical") {
      for (let i = 0; i < length; i += 1) {
        this.board[row + i][column] = ship;
      }
    }

    this.ships.push(ship);
    return "placed";
  }

  checkCoordinates(coordinates, length, orientation) {
    // Check if there's a ship in any of the coordinates another ship would take
    const [row, column] = coordinates;
    if (orientation === "horizontal") {
      for (let i = 0; i < length; i += 1) {
        if (this.board[row][column + i] instanceof Ship) {
          return false;
        }
      }
    } else if (orientation === "vertical") {
      for (let i = 0; i < length; i += 1) {
        if (this.board[row + i][column] instanceof Ship) {
          return false;
        }
      }
    }
    return true;
  }

  createBoard(size) {
    return Array.from({ length: size[1] }, () => Array(size[0]).fill("-"));
  }

  printBoard() {
    let board = "";
    for (let row of this.board) {
      const rowDisplay = [];
      for (let cell of row) {
        if (cell instanceof Ship) {
          rowDisplay.push(" S ");
        } else {
          rowDisplay.push(" - ");
        }
      }
      board = board + rowDisplay.join(" ") + "\n";
    }
    console.log("BOARD:");
    console.log(board);
  }

  areCoordinatesEqual(coord1, coord2) {
    if (
      !Array.isArray(coord1) ||
      !Array.isArray(coord2) ||
      coord1.length !== 2 ||
      coord2.length !== 2
    ) {
      return false;
    }
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
  }

  receiveAttack(coordinates) {
    const [row, column] = coordinates;
    if (
      row >= this.size[1] ||
      column >= this.size[0] ||
      row < 0 ||
      column < 0
    ) {
      return "invalid"; // Out of bounds
    }
    for (let i = 0; i < this.attackedCoordinates.length; i += 1) {
      if (this.areCoordinatesEqual(this.attackedCoordinates[i], coordinates)) {
        return "repeat";
      }
    }
    if (this.board[row][column] instanceof Ship) {
      const ship = this.board[row][column];
      ship.hit();
      if (ship.isSunk()) {
        this.attackedCoordinates.push(coordinates);
        return "sunk";
      }
    } else {
      this.missedAttacks.push(coordinates);
      this.attackedCoordinates.push(coordinates);
      return "miss";
    }
    this.attackedCoordinates.push(coordinates);
    return "hit";
  }

  areAllShipsSunk() {
    if (this.ships.length === 0) {
      return false;
    }
    return this.ships.every((ship) => ship.isSunk() === true);
  }

  clear() {
    this.board = this.createBoard(this.size);
    this.ships = [];
    this.missedAttacks = [];
    this.attackedCoordinates = [];
  }

  placeShipsRandomly() {
    FLEET_DEFINITIONS.forEach((shipDefinition) => {
      let placed = false;
      while (!placed) {
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
        const row = Math.floor(Math.random() * this.size[1]);
        const column = Math.floor(Math.random() * this.size[0]);

        const result = this.placeShip(
          [row, column],
          orientation,
          shipDefinition.length,
        );
        if (result === "placed") {
          placed = true;
        }
      }
    });
  }

  removeShip(shipToRemove) {
    let found = false;
    for (let row = 0; row < this.size[1]; row += 1) {
      for (let column = 0; column < this.size[0]; column += 1) {
        if (this.board[row][column] === shipToRemove) {
          this.board[row][column] = "-";
          found = true;
        }
      }
    }
    if (found) {
      this.ships = this.ships.filter((ship) => ship !== shipToRemove);
    }
    return found;
  }
}

module.exports = Gameboard;
