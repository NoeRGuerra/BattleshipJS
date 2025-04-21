class Gameboard {
  constructor(width, height) {
    this.size = [width, height];
    this.board = this.createBoard(this.size);
  }

  placeShip(coordinates, orientation, length){
  }

  createBoard(size){
    console.log("Creating board...");
    return Array(size[1]).fill(Array(size[0]).fill("-"));
  }

  printBoard(){
    let board = "";
    for (let row of this.board){
      board = board.concat(row.join(" "));
      board = board.concat("\n");
    }
    console.log("BOARD:");
    console.log(board);
  }

  receiveAttack(coordinates){
    
  }
}

module.exports = Gameboard;
