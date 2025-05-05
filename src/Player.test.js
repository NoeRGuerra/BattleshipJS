const Player = require('./Player');

describe('Player tests', () => {
    test("Check that player type can be set as real or computer", () => {
        const player1 = new Player('real');
        const player2 = new Player('computer');

        expect(player1.type).toBe('real');
        expect(player2.type).toBe('computer');
    });

    test("Check that player type can't be set as an invalid value", () => {
        expect(() => { new Player('shazam') }).toThrow(Error);
        expect(() => { new Player(12) }).toThrow(Error);
    });

    test("Check board is created correctly", () => {
        const player = new Player('real', 8, 8);
        expect(player.gameboard.size).toEqual([8,8]);
    })
})