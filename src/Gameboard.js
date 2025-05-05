const Ship = require("./Ship");

class Gameboard {
  constructor(width, height) {
    this.size = [width, height];
    this.board = this.createBoard(this.size);
    this.ships = [];
  }

  placeShip(coordinates, orientation, length) {
    const ship = new Ship(length);
    const [row, column] = coordinates;
    if ((orientation == "horizontal" && length > this.size[0]) || (orientation == "vertical" && length > this.size[1] || length < 1)) { // Check if ship is bigger than map
      return "Error 1";
    }
    else if (row < 0 || row > this.size[1] - 1 || column < 0 || column > this.size[0] - 1) { // Check if coordinates are outside map bounds
      return "Error 2";
    }
    else if ((orientation == "horizontal" && (coordinates[1] + length > this.size[0])) ||
      (orientation == "vertical" && (coordinates[0] + length > this.size[1]))) { // Check if ship fits in the map at current coordinates
      console.log(orientation);
      console.log(`${coordinates[0]} + ${length}  = ${coordinates[0] + length} > ${this.size[0]}`);
      return "Error 3";
    }

    if (orientation == 'horizontal') {
      for (let i = 0; i < length; i++) {
        this.board[row][column + i] = ship;
      }
    } else if (orientation == "vertical"){
      for (let i = 0; i < length; i++) {
        this.board[row + i][column] = ship;
      }
    }

    this.ships.push(ship);
  }

  checkCoordinates(coordinates, length) {
    // Check if there's a ship in any of the coordinates another ship would take
  }

  createBoard(size) {
    console.log("Creating board...");
    return Array.from({ length: size[1] }, () => Array(size[0]).fill('-'));
  }

  printBoard() {
    let board = "";
    for (let row of this.board) {
      board = board.concat(row.join(" "));
      board = board.concat("\n");
    }
    console.log("BOARD:");
    console.log(board);
  }

  receiveAttack(coordinates) {

  }
}

module.exports = Gameboard;
