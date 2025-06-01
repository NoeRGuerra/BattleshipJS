const Player = require("./Player");
const Gameboard = require("./Gameboard");

describe("Player tests", () => {
  test("should allow player type to be `real`", () => {
    const player = new Player("real");
    expect(player.type).toBe("real");
  });

  test("should allow player type to be `computer`", () => {
    const player = new Player("computer");
    expect(player.type).toBe("computer");
  });

  test("should reject player types that are not `real` or `computer`", () => {
    expect(() => {
      new Player("shazam");
    }).toThrow(Error);
    expect(() => {
      new Player("abcdef");
    }).toThrow(Error);
    expect(() => {
      new Player("human");
    }).toThrow(Error);
  });

  test("should reject player types that are not strings", () => {
    expect(() => {
      new Player(undefined);
    }).toThrow(Error);
    expect(() => {
      new Player(null);
    }).toThrow(Error);
    expect(() => {
      new Player(12);
    }).toThrow(Error);
    expect(() => {
      new Player({});
    }).toThrow(Error);
  });

  test("should create gameboard with correct size", () => {
    const player = new Player("real", 8, 8);
    expect(player.gameboard.size).toEqual([8, 8]);
  });

  test("should create gameboard with default size if no size is provided", () => {
    const player = new Player("real");
    expect(player.gameboard.size).toEqual([10, 10]);
  });

  test("should contain an instance of Gameboard", () => {
    const player = new Player("real");
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });
});
