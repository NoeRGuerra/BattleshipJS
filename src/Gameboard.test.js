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

    expect(gameboard.board).toEqual(expectedBoard);
  })
  
  test("Check that ships can't overlap", () => {
    const firstShipData = {
      length: 3,
      coords: [2,2],
      orientation: 'horizontal'
    };
    const secondShipData = {
      length: 2,
      coords: [1,2],
      orientation: 'vertical'
    };

    expect(gameboard.placeShip(firstShipData.coords, firstShipData.orientation, firstShipData.length)).toBe(true);
    expect(gameboard.placeShip(secondShipData.coords, secondShipData.orientation, secondShipData.length)).toBe(false);
  })

  test("Check that ships can be hit and sunk", () => {
    const shipData = {
      length: 3,
      coords: [2,2],
      orientation: 'horizontal'
    };

    gameboard.placeShip(shipData.coords, shipData.orientation, shipData.length);
    let ship = gameboard.ships[0];
    gameboard.receiveAttack(shipData.coords);
    shipData.coords = [2,3]
    gameboard.receiveAttack(shipData.coords);
    shipData.coords = [2,4]
    gameboard.receiveAttack(shipData.coords);
    expect(ship.isSunk()).toBe(true);
  })

  test("Check that you can't attack the same coordinates twice", () => {
    const shipData = {
      length: 3,
      coords: [2,2],
      orientation: 'horizontal'
    };

    gameboard.placeShip(shipData.coords, shipData.orientation, shipData.length);
    gameboard.receiveAttack(shipData.coords);
    expect(gameboard.receiveAttack(shipData.coords)).toBe(false);
  })

  test("Check that all the ships are sunk", () => {
    const firstShipData = {
      length: 3,
      coords: [2,2],
      orientation: 'horizontal'
    };
    const secondShipData = {
      length: 2,
      coords: [1,1],
      orientation: 'horizontal'
    };
    const thirdShipData = {
      length: 1,
      coords: [3,3],
      orientation: 'horizontal'
    };

    gameboard.placeShip(firstShipData.coords, firstShipData.orientation, firstShipData.length);
    gameboard.placeShip(secondShipData.coords, secondShipData.orientation, secondShipData.length);
    gameboard.placeShip(thirdShipData.coords, thirdShipData.orientation, thirdShipData.length);

    gameboard.receiveAttack([2,2]);
    gameboard.receiveAttack([2,3]);
    gameboard.receiveAttack([2,4]);
    expect(gameboard.areAllShipsSunk()).toBe(false);

    gameboard.receiveAttack([1,1]);
    gameboard.receiveAttack([1,2]);
    expect(gameboard.areAllShipsSunk()).toBe(false);

    gameboard.receiveAttack([3,3]);
    expect(gameboard.areAllShipsSunk()).toBe(true);
  })
});
