const Ship = require("./Ship");

describe("Ship tests", () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(4);
  });

  test("should set the correct length for the ship", () => {
    expect(ship.length).toBe(4);
  });

  test('should set the correct hits for a newly created ship', () => {
    expect(ship.hits).toBe(0);
  })

  test("should increase hit counter when calling hit()", () => {
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  describe('isSunk() method', () => {
    test("should return false initially", () => {
      expect(ship.isSunk()).toBe(false);
    });

    test("should return true if hits are equal to ship's length", () => {
      ship.hit();
      ship.hit();
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });

    test("should return false if hits are less than ship's length", () => {
      ship.hit();
      ship.hit()
      expect(ship.isSunk()).toBe(false);
    });

    test("should return true if ship is hit after being sunk", () => {
      ship.hit();
      ship.hit();
      ship.hit();
      ship.hit();
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    });

    test('should be sunk after one hit if length is 1', () => {
      ship = new Ship(1);
      ship.hit();
      expect(ship.isSunk()).toBe(true);
    })
  })
});
