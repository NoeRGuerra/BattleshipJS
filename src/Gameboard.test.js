const Gameboard = module.require("./Gameboard");
const Ship = module.require("./Ship");

describe("Gameboard tests", () => {
  const boardWidth = 5;
  const boardHeight = 5;
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard(boardWidth, boardHeight);
  });

  test("board grid should be empty after creation", () => {
    const expectedBoard = [
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
      ['-', '-', '-', '-', '-'],
    ];
    expect(gameboard.board).toEqual(expectedBoard);
  })

  test("board should have correct dimensions after creation", () => {
    expect(gameboard.size).toEqual([boardWidth, boardHeight]);
  });

  test("should place ships horizontally in the right coordinates", () => {
    const shipLength = 3;
    const startCoords = [2, 2];
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

  test("should place ships vertically in the right coordinates", () => {
    const shipLength = 3;
    const startCoords = [1, 2];
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

  test("should allow placing multiple non-overlapping ships", () => {
    const firstShipData = {
      length: 3,
      coords: [2, 2],
      orientation: 'horizontal'
    };
    const secondShipData = {
      length: 2,
      coords: [1, 2],
      orientation: 'vertical'
    };

    expect(gameboard.placeShip(firstShipData.coords, firstShipData.orientation, firstShipData.length)).toBe(true);
    expect(gameboard.placeShip(secondShipData.coords, secondShipData.orientation, secondShipData.length)).toBe(false);
  })

  test('should not allow placing ships of length zero', () => {
    expect(gameboard.placeShip([2,2], 'horizontal', 0)).toBe(false);
  });

  test("should allow to sink ships", () => {
    gameboard.placeShip([2,2], 'horizontal', 3);
    let ship = gameboard.ships[0];
    gameboard.receiveAttack([2,2]);
    gameboard.receiveAttack([2,3]);
    gameboard.receiveAttack([2,4]);
    expect(ship.isSunk()).toBe(true);
  })

  test("should not allow to attack the same coordinates twice", () => {
    const shipData = {
      length: 3,
      coords: [2, 2],
      orientation: 'horizontal'
    };

    gameboard.placeShip(shipData.coords, shipData.orientation, shipData.length);
    gameboard.receiveAttack(shipData.coords);
    expect(gameboard.receiveAttack(shipData.coords)).toBe(false);
  })

  test("should report when all ships are sunk", () => {
    const firstShipData = {
      length: 3,
      coords: [2, 2],
      orientation: 'horizontal'
    };
    const secondShipData = {
      length: 2,
      coords: [1, 1],
      orientation: 'horizontal'
    };
    const thirdShipData = {
      length: 1,
      coords: [3, 3],
      orientation: 'horizontal'
    };

    gameboard.placeShip(firstShipData.coords, firstShipData.orientation, firstShipData.length);
    gameboard.placeShip(secondShipData.coords, secondShipData.orientation, secondShipData.length);
    gameboard.placeShip(thirdShipData.coords, thirdShipData.orientation, thirdShipData.length);

    gameboard.receiveAttack([2, 2]);
    gameboard.receiveAttack([2, 3]);
    gameboard.receiveAttack([2, 4]);
    expect(gameboard.areAllShipsSunk()).toBe(false);

    gameboard.receiveAttack([1, 1]);
    gameboard.receiveAttack([1, 2]);
    expect(gameboard.areAllShipsSunk()).toBe(false);

    gameboard.receiveAttack([3, 3]);
    expect(gameboard.areAllShipsSunk()).toBe(true);
  })

  test("should allow placing ships at the edges of the board", () => {
    expect(gameboard.placeShip([0, 0], 'horizontal', 1)).toBe(true);
    expect(gameboard.placeShip([0, 4], 'horizontal', 1)).toBe(true);
    expect(gameboard.placeShip([4, 0], 'horizontal', 1)).toBe(true);
    expect(gameboard.placeShip([4, 4], 'horizontal', 1)).toBe(true);
  });

  test("should not allow placing ships at invalid positions", () => {
    expect(gameboard.placeShip([-1, -1], 'horizontal', 3)).toBe(false);
    expect(gameboard.placeShip([3, -1], 'horizontal', 2)).toBe(false);
    expect(gameboard.placeShip([-1, 3], 'horizontal', 2)).toBe(false);
    expect(gameboard.placeShip(['1', '3'], 'horizontal', 2)).toBe(false);
  });


  test("should not allow placing ships larger than the board", () => {
    expect(gameboard.placeShip([2, 2], 'horizontal', 7)).toBe(false);
    expect(gameboard.placeShip([0, 0], 'horizontal', 6)).toBe(false);
    expect(gameboard.placeShip([-1, 3], 'horizontal', -2)).toBe(false);
  });

  test("should allow attacking empty squares of water", () => {
    gameboard.placeShip([2, 2], 'horizontal', 3);
    gameboard.placeShip([3, 3], 'horizontal', 2);
    expect(gameboard.receiveAttack([1, 1])).toBe(true);
    expect(gameboard.receiveAttack([4, 4])).toBe(true);
  });

  test('should not allow attacking outside the board bounds', () => {
    expect(gameboard.receiveAttack([6,6])).toBe(false);
  })

  test('should not sink ship after a single hit', () => {
    gameboard.placeShip([2, 2], 'horizontal', 3);
    const ship = gameboard.ships[0];
    gameboard.receiveAttack([2,2]);
    expect(ship.isSunk()).toBe(false);
  })

  test('should allow hitting multiple ships in the same board', () => {
    gameboard.placeShip([2, 2], 'horizontal', 3);
    gameboard.placeShip([3, 3], 'horizontal', 2);
    gameboard.receiveAttack([2,2]);
    gameboard.receiveAttack([3,3]);
    gameboard.receiveAttack([3,4]);
    gameboard.receiveAttack([2,3]);
    gameboard.receiveAttack([2,4]);
    expect(gameboard.attackedCoordinates).toEqual([[2,2],[3,3],[3,4],[2,3],[2,4]]);
  })
});
