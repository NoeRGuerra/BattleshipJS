const Gameboard = module.require("./Gameboard");
const Ship = module.require("./Ship");

describe("Gameboard tests", () => {
  const boardWidth = 5;
  const boardHeight = 5;
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard(boardWidth, boardHeight);
  });

  test("Check that board exists after creation", () => {
    const expectedBoard = [
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
    ];
    expect(gameboard.board).toEqual(expectedBoard);
  })

  test("Check that board has a size", () => {
    expect(gameboard.size).toEqual([boardWidth, boardHeight]);
  });

  test("Check that ships can be placed horizontally", () => {
    const shipLength = 3;
    const startCoords = [2,2];
    const shipOrientation = "horizontal";

    gameboard.placeShip(startCoords, shipOrientation, shipLength);
    let ship = gameboard.ships[0];
    expect(ship.length).toEqual(shipLength);
    
    const expectedBoard = [
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', ship, ship, ship],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
    ]
    expect(gameboard.board).toEqual(expectedBoard);
  })

  test("Check that ships can be placed vertically", () => {
    const shipLength = 3;
    const startCoords = [1,2];
    const shipOrientation = "vertical";

    gameboard.placeShip(startCoords, shipOrientation, shipLength);
    let ship = gameboard.ships[0];
    expect(ship.length).toEqual(shipLength);
    
    const expectedBoard = [
      ['-', '-', '-', '-', '-'],
      ['-', '-', ship, '-', '-'],
      ['-', '-', ship, '-', '-'],
      ['-', '-', ship, '-', '-'],
      ['-', '-', '-', '-', '-'],
    ]
    console.log("Actual Board:", gameboard.board);
    console.log("Expected Board:", expectedBoard);

    expect(gameboard.board).toEqual(expectedBoard);
  })
  
});
