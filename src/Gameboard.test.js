const Gameboard = module.require("./Gameboard");

describe("Gameboard tests", () => {
  const boardWidth = 5;
  const boardHeight = 5;
  let gameboard;

  beforeEach(() => {
    gameboard = new Gameboard(boardWidth, boardHeight);
  });

  test("board grid should be empty after creation", () => {
    const expectedBoard = [
      ["-", "-", "-", "-", "-"],
      ["-", "-", "-", "-", "-"],
      ["-", "-", "-", "-", "-"],
      ["-", "-", "-", "-", "-"],
      ["-", "-", "-", "-", "-"],
    ];
    expect(gameboard.board).toEqual(expectedBoard);
  });

  test("board should have correct dimensions after creation", () => {
    expect(gameboard.size).toEqual([boardWidth, boardHeight]);
  });

  describe("placeShip() method", () => {
    test("should place ships horizontally in the right coordinates", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      let ship = gameboard.ships[0];
      expect(ship.length).toEqual(3);

      const expectedBoard = [
        ["-", "-", "-", "-", "-"],
        ["-", "-", "-", "-", "-"],
        ["-", "-", ship, ship, ship],
        ["-", "-", "-", "-", "-"],
        ["-", "-", "-", "-", "-"],
      ];
      expect(gameboard.board).toEqual(expectedBoard);
    });

    test("should place ships vertically in the right coordinates", () => {
      const shipLength = 3;
      const startCoords = [1, 2];
      const shipOrientation = "vertical";

      gameboard.placeShip(startCoords, shipOrientation, shipLength);
      let ship = gameboard.ships[0];
      expect(ship.length).toEqual(shipLength);

      const expectedBoard = [
        ["-", "-", "-", "-", "-"],
        ["-", "-", ship, "-", "-"],
        ["-", "-", ship, "-", "-"],
        ["-", "-", ship, "-", "-"],
        ["-", "-", "-", "-", "-"],
      ];

      expect(gameboard.board).toEqual(expectedBoard);
    });

    test("should not allow placing overlapping ships", () => {
      const firstShipData = {
        length: 3,
        coords: [2, 2],
        orientation: "horizontal",
      };
      const secondShipData = {
        length: 2,
        coords: [1, 2],
        orientation: "vertical",
      };

      expect(
        gameboard.placeShip(
          firstShipData.coords,
          firstShipData.orientation,
          firstShipData.length,
        ),
      ).toBe("placed");
      expect(
        gameboard.placeShip(
          secondShipData.coords,
          secondShipData.orientation,
          secondShipData.length,
        ),
      ).toBe("overlap");
    });

    test("should not allow placement that exactly covers an existing ship", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      expect(gameboard.placeShip([2, 2], "horizontal", 3)).toBe("overlap");
    });

    test("should not allow placing an overlapping ship that is partially off-board", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      expect(gameboard.placeShip([-1, -1], "horizontal", 4)).toBe(
        "out_of_bounds",
      );
    });

    test("should not allow placing ships of length zero", () => {
      expect(gameboard.placeShip([2, 2], "horizontal", 0)).toBe(
        "invalid_length",
      );
    });

    test("should allow placing ships at the edges of the board", () => {
      expect(gameboard.placeShip([0, 0], "horizontal", 1)).toBe("placed");
      expect(gameboard.placeShip([0, 4], "horizontal", 1)).toBe("placed");
      expect(gameboard.placeShip([4, 0], "horizontal", 1)).toBe("placed");
      expect(gameboard.placeShip([4, 4], "horizontal", 1)).toBe("placed");
    });

    test("should not allow placing ships at invalid positions", () => {
      expect(gameboard.placeShip([-1, -1], "horizontal", 3)).toBe(
        "out_of_bounds",
      );
      expect(gameboard.placeShip([3, -1], "horizontal", 2)).toBe(
        "out_of_bounds",
      );
      expect(gameboard.placeShip([-1, 3], "horizontal", 2)).toBe(
        "out_of_bounds",
      );
    });

    test("should not allow non-numbers to be passed as coordinates", () => {
      expect(gameboard.placeShip(["a", "b"], "horizontal", 2)).toBe(
        "invalid_coordinates",
      );
      expect(gameboard.placeShip(["1", "3"], "horizontal", 2)).toBe(
        "invalid_coordinates",
      );
      expect(gameboard.placeShip([1, "b"], "horizontal", 2)).toBe(
        "invalid_coordinates",
      );
      expect(gameboard.placeShip(["a", 2], "horizontal", 2)).toBe(
        "invalid_coordinates",
      );
      expect(gameboard.placeShip([1, 1], "horizontal", "2")).toBe(
        "invalid_length_type",
      );

      expect(gameboard.placeShip([1, 1], "horizontal", "a")).toBe(
        "invalid_length_type",
      );
    });

    test("should not allow placing ships larger than the board", () => {
      expect(gameboard.placeShip([2, 2], "horizontal", 7)).toBe(
        "invalid_length",
      );
      expect(gameboard.placeShip([0, 0], "horizontal", 6)).toBe(
        "invalid_length",
      );
      expect(gameboard.placeShip([-1, 3], "horizontal", -2)).toBe(
        "invalid_length",
      );
    });

    test("should place a ship of length 1 at any valid coordinate", () => {
      expect(gameboard.placeShip([2, 4], "horizontal", 1)).toBe("placed");
    });

    test("should not allow horizontal placement on last column if ship length > 1", () => {
      expect(
        gameboard.placeShip([boardWidth - 1, boardHeight - 1], "horizontal", 2),
      ).toBe("does_not_fit");
    });

    test("should not allow vertical placement on last row if ship length > 1", () => {
      expect(
        gameboard.placeShip([boardWidth - 1, boardHeight - 1], "vertical", 2),
      ).toBe("does_not_fit");
    });
  });

  describe("receiveAttack() method", () => {
    test("should return `hit` for successful attacks", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      expect(gameboard.receiveAttack([2, 2])).toBe("hit");
    });

    test("should return `miss` for missed attacks", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      expect(gameboard.receiveAttack([1, 2])).toBe("miss");
    });

    test("should return `repeat` for repeated hits", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 2]);
      expect(gameboard.receiveAttack([2, 2])).toBe("repeat");
    });

    test("should return `repeat` for repeated misses", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([1, 2]);
      expect(gameboard.receiveAttack([1, 2])).toBe("repeat");
    });

    test("should return `invalid` for attacks out of bouds", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      expect(gameboard.receiveAttack([5, 5])).toBe("invalid");
    });

    test("should return `sunk` if attack sunk the ship", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([2, 3]);
      expect(gameboard.receiveAttack([2, 4])).toBe("sunk");
    });

    test("should increment hit count when hitting the first segment of a ship", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 2]);
      const ship = gameboard.ships[0];
      expect(ship.hits).toBe(1);
    });

    test("should increment hit count when hitting the middle segment of a ship", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 3]);
      const ship = gameboard.ships[0];
      expect(ship.hits).toBe(1);
    });

    test("should increment hit count when hitting the last segment of a ship", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 4]);
      const ship = gameboard.ships[0];
      expect(ship.hits).toBe(1);
    });

    test("should allow to sink ships", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      let ship = gameboard.ships[0];
      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([2, 3]);
      gameboard.receiveAttack([2, 4]);
      expect(ship.isSunk()).toBe(true);
    });

    test("should not allow to attack the same coordinates twice", () => {
      const shipData = {
        length: 3,
        coords: [2, 2],
        orientation: "horizontal",
      };

      gameboard.placeShip(
        shipData.coords,
        shipData.orientation,
        shipData.length,
      );
      gameboard.receiveAttack(shipData.coords);
      expect(gameboard.receiveAttack(shipData.coords)).toBe("repeat");
    });

    test("should allow attacking empty squares of water", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.placeShip([3, 3], "horizontal", 2);
      expect(gameboard.receiveAttack([1, 1])).toBe("miss");
      expect(gameboard.receiveAttack([4, 4])).toBe("miss");
    });

    test("should not sink ship after a single hit", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      const ship = gameboard.ships[0];
      gameboard.receiveAttack([2, 2]);
      expect(ship.isSunk()).toBe(false);
    });

    test("should allow hitting multiple ships in the same board", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.placeShip([3, 3], "horizontal", 2);
      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([3, 3]);
      gameboard.receiveAttack([3, 4]);
      gameboard.receiveAttack([2, 3]);
      gameboard.receiveAttack([2, 4]);
      expect(gameboard.attackedCoordinates).toEqual([
        [2, 2],
        [3, 3],
        [3, 4],
        [2, 3],
        [2, 4],
      ]);
    });
  });

  describe("Recording attacks", () => {
    test("should record coordinates of successful attack", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 2]);
      expect(gameboard.attackedCoordinates).toEqual([[2, 2]]);
    });

    test("should record coordinates of missed attack", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 1]);
      expect(gameboard.attackedCoordinates).toEqual([[2, 1]]);
      expect(gameboard.missedAttacks).toEqual([[2, 1]]);
    });

    test("should not record repeated hits", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([2, 2]);
      expect(gameboard.attackedCoordinates).toEqual([[2, 2]]);
    });

    test("should not record repeated misses", () => {
      gameboard.placeShip([2, 2], "horizontal", 3);
      gameboard.receiveAttack([2, 1]);
      gameboard.receiveAttack([2, 1]);
      gameboard.receiveAttack([2, 1]);
      expect(gameboard.attackedCoordinates).toEqual([[2, 1]]);
    });
  });

  describe("areAllShipsSunk() method", () => {
    test("should return true when all ships are sunk", () => {
      const firstShipData = {
        length: 3,
        coords: [2, 2],
        orientation: "horizontal",
      };
      const secondShipData = {
        length: 2,
        coords: [1, 1],
        orientation: "horizontal",
      };
      const thirdShipData = {
        length: 1,
        coords: [3, 3],
        orientation: "horizontal",
      };

      gameboard.placeShip(
        firstShipData.coords,
        firstShipData.orientation,
        firstShipData.length,
      );
      gameboard.placeShip(
        secondShipData.coords,
        secondShipData.orientation,
        secondShipData.length,
      );
      gameboard.placeShip(
        thirdShipData.coords,
        thirdShipData.orientation,
        thirdShipData.length,
      );

      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([2, 3]);
      gameboard.receiveAttack([2, 4]);

      gameboard.receiveAttack([1, 1]);
      gameboard.receiveAttack([1, 2]);

      gameboard.receiveAttack([3, 3]);
      expect(gameboard.areAllShipsSunk()).toBe(true);
    });

    test("should return false if not all ships are sunk", () => {
      const firstShipData = {
        length: 3,
        coords: [2, 2],
        orientation: "horizontal",
      };
      const secondShipData = {
        length: 2,
        coords: [1, 1],
        orientation: "horizontal",
      };
      const thirdShipData = {
        length: 1,
        coords: [3, 3],
        orientation: "horizontal",
      };

      gameboard.placeShip(
        firstShipData.coords,
        firstShipData.orientation,
        firstShipData.length,
      );
      gameboard.placeShip(
        secondShipData.coords,
        secondShipData.orientation,
        secondShipData.length,
      );
      gameboard.placeShip(
        thirdShipData.coords,
        thirdShipData.orientation,
        thirdShipData.length,
      );

      gameboard.receiveAttack([2, 2]);
      gameboard.receiveAttack([2, 4]);

      gameboard.receiveAttack([1, 1]);
      gameboard.receiveAttack([1, 2]);

      gameboard.receiveAttack([3, 3]);
      expect(gameboard.areAllShipsSunk()).toBe(false);
    });

    test("should return false if no ships are placed", () => {
      expect(gameboard.areAllShipsSunk()).toBe(false);
    });

    test("should return false if ships are placed, but none are hit", () => {
      const firstShipData = {
        length: 3,
        coords: [2, 2],
        orientation: "horizontal",
      };
      const secondShipData = {
        length: 2,
        coords: [1, 1],
        orientation: "horizontal",
      };
      const thirdShipData = {
        length: 1,
        coords: [3, 3],
        orientation: "horizontal",
      };

      gameboard.placeShip(
        firstShipData.coords,
        firstShipData.orientation,
        firstShipData.length,
      );
      gameboard.placeShip(
        secondShipData.coords,
        secondShipData.orientation,
        secondShipData.length,
      );
      gameboard.placeShip(
        thirdShipData.coords,
        thirdShipData.orientation,
        thirdShipData.length,
      );

      expect(gameboard.areAllShipsSunk()).toBe(false);
    });
  });
});
