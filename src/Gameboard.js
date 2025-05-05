const Ship = require("./Ship");

class Gameboard {
  constructor(width, height) {
    this.size = [width, height];
    this.board = this.createBoard(this.size);
    this.ships = [];
    this.attackedCoordinates = [];
  }

  placeShip(coordinates, orientation, length) {
    const ship = new Ship(length);
    const [row, column] = coordinates;
    if ((orientation == "horizontal" && length > this.size[0]) || (orientation == "vertical" && length > this.size[1] || length < 1)) { // Check if ship is bigger than map
      console.log("Ship can't be larger than board");
      return false;
    }
    else if (row < 0 || row > this.size[1] - 1 || column < 0 || column > this.size[0] - 1) { // Check if coordinates are outside map bounds
      console.log("Ship can't be placed outside board");
      return false;
    }
    else if ((orientation == "horizontal" && (coordinates[1] + length > this.size[0])) ||
      (orientation == "vertical" && (coordinates[0] + length > this.size[1]))) { // Check if ship fits in the map at current coordinates
      console.log("Ship placement invalid");
      return false;
    }
    if (!this.checkCoordinates(coordinates, length, orientation)) {
      console.log("Ship overlaps with another ship");
      return false;
    }

    if (orientation == 'horizontal') {
      for (let i = 0; i < length; i++) {
        this.board[row][column + i] = ship;
      }
    } else if (orientation == "vertical") {
      for (let i = 0; i < length; i++) {
        this.board[row + i][column] = ship;
      }
    }

    this.ships.push(ship);
    return true;
  }

  checkCoordinates(coordinates, length, orientation) {
    // Check if there's a ship in any of the coordinates another ship would take
    const [row, column] = coordinates;
    if (orientation == 'horizontal') {
      for (let i = 0; i < length; i++) {
        if (this.board[row][column + i] instanceof Ship) {
          return false;
        };
      }
    } else if (orientation == "vertical") {
      for (let i = 0; i < length; i++) {
        if (this.board[row + i][column] instanceof Ship) {
          return false;
        };
      }
    }
    return true;
  }

  createBoard(size) {
    return Array.from({ length: size[1] }, () => Array(size[0]).fill('-'));
  }

  printBoard() {
    let board = "";
    for (let row of this.board) {
      const rowDisplay = []
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

  receiveAttack(coordinates) {
    for (let coord of this.attackedCoordinates) {
      if (coord.toString() == coordinates.toString()) {
        return false;
      }
    }
    const [row, column] = coordinates;
    if (this.board[row][column] instanceof Ship) {
      const ship = this.board[row][column];
      ship.hit();
    }
    this.attackedCoordinates.push(coordinates);
    return true;
  }
}

module.exports = Gameboard;
