const Gameboard = module.require("./Gameboard");

describe("Gameboard tests", () => {
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard(10, 10);
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
    expect(gameboard.size).toEqual([10,10]);
  });

  test("Check that ships can be placed", () => {
    const expectedBoard = [
      ['-', '-', '-', '-', 'x'],
      ['-', '-', '-', '-', 'x'],
      ['-', '-', '-', '-', 'x'],
      ['-', '-', '-', '-', 'x'],
      ['-', '-', '-', '-', 'x'],
    ]
    gameboard.placeShip([5, 5], "horizontal", 5);
    expect(gameboard.board).toEqual(expectedBoard);
  })
  
});
