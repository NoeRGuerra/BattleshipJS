// index.js
import "./styles.css";
import Player from './Player';

// let width = prompt("Enter board size:");
let width = 10;
while (!isInputValid(width)) {
    alert('Invalid input, try again.');
    width = prompt("Enter board size:");
}

function isInputValid(input) {
    if (isNaN(input) || parseInt(input) < 5) {
        return false;
    }
    return true;
}

const playerOne = new Player('real', width, width);
const playerTwo = new Player('computer', width, width);
const boardsContainer = document.querySelector('#boards-container');

function displayBoard(player) {
    const [width, height] = player.gameboard.size;
    const boardTable = document.createElement('table');
    for (let row = 0; row < height; row++) {
        const tableRow = document.createElement('tr');
        for (let column = 0; column < width; column++) {
            const tableCell = document.createElement('td');
            tableCell.setAttribute('data-x', `${column}`);
            tableCell.setAttribute('data-y', `${row}`);
            tableRow.appendChild(tableCell);
        }
        boardTable.appendChild(tableRow);
    }
    boardsContainer.appendChild(boardTable);
}


displayBoard(playerOne);
displayBoard(playerTwo);