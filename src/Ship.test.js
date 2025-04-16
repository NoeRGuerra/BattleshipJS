const Ship = require("./Ship");

describe("Ship tests", () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(4);
  });

  test("Check that the ship has a length", () => {
    expect(ship.length).toBe(4);
  });

  test("Check that the ship is not sunk after creating", () => {
    expect(ship.isSunk()).toBe(false);
  });

  test("Check that the ship can be hit", () => {
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test("Check that the ship can be sunk", () => {
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});
