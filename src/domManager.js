import Ship from "./Ship";
import { FLEET_DEFINITIONS } from "./gameConfig";
// For now, focus only on player vs computer

let selectedShip = null;

function setPlayersContainers() {
  const boardsContainer = document.querySelector("#boards-container");
  const playerOneContainer = document.createElement("div");
  playerOneContainer.setAttribute("id", "player-one-container");
  const playerTwoContainer = document.createElement("div");
  playerTwoContainer.setAttribute("id", "player-two-container");
  boardsContainer.append(playerOneContainer);
  boardsContainer.append(playerTwoContainer);
}

function createBoard(player, parentContainer, isComputerBoard = false) {
  const [width, height] = player.gameboard.size;
  const boardTable = document.createElement("table");
  for (let row = 0; row < height; row++) {
    const tableRow = document.createElement("tr");
    for (let column = 0; column < width; column++) {
      const tableCell = document.createElement("td");
      tableCell.setAttribute("data-x", `${column}`);
      tableCell.setAttribute("data-y", `${row}`);
      if (!isComputerBoard) {
        tableCell.addEventListener("click", () => {
          if (selectedShip) {
            console.log(
              `Placing ${selectedShip["name"]}: ${selectedShip["length"]} on [${row}, ${column}], ${selectedShip["orientation"]}`,
            );
            let result = player.gameboard.placeShip(
              [row, column],
              selectedShip["orientation"],
              selectedShip["length"],
            );
            console.log(`result = ${result}`);
            if (result === "placed") {
              const buttons = parentContainer.querySelectorAll(
                ".buttons-container button",
              );
              const selectedShipBtn = Array.from(buttons).find((button) =>
                button.textContent.includes(selectedShip["name"]),
              );
              selectedShipBtn.remove();
              selectedShip = null;
              updateBoard(player, boardTable);
              player.gameboard.printBoard();
            }
          }
        });
      }
      tableRow.appendChild(tableCell);
    }
    boardTable.appendChild(tableRow);
  }
  parentContainer.appendChild(boardTable);
}

function updateBoard(player, tableElement, isComputerBoard = false) {
  const playerBoard = player.gameboard.board;
  const missedAttacks = player.gameboard.missedAttacks;
  const hits = player.gameboard.attackedCoordinates;
  for (let row = 0; row < playerBoard.length; row += 1) {
    for (let column = 0; column < playerBoard[row].length; column += 1) {
      let cell = tableElement.querySelector(
        `td[data-x="${column}"][data-y="${row}"]`,
      );
      cell.classList.remove("hit", "miss", "ship"); // Clear styles before applying new
      if (
        missedAttacks.some((coord) => coord[0] === row && coord[1] === column)
      ) {
        cell.classList.add("miss");
      } else if (
        hits.some((coord) => coord[0] === row && coord[1] === column)
      ) {
        cell.classList.add("hit");
      }
      if (playerBoard[row][column] instanceof Ship && !isComputerBoard) {
        cell.classList.add("ship");
      }
    }
  }
}

function updatePlayerOneBoard(player) {
  const tableBoard = document.querySelector("#player-one-container>table");
  return updateBoard(player, tableBoard);
}

function updatePlayerTwoBoard(player) {
  const tableBoard = document.querySelector("#player-two-container>table");
  return updateBoard(player, tableBoard);
}

function addFleetButtons() {
  const playerOneContainer = document.querySelector("#player-one-container");
  const buttonsContainer = document.createElement("div");
  buttonsContainer.setAttribute("class", "buttons-container");
  //   const playerTwoContainer = document.querySelector("#player-two-container");
  for (let i = 0; i < FLEET_DEFINITIONS.length; i += 1) {
    const button = document.createElement("button");
    button.textContent = `${FLEET_DEFINITIONS[i]["name"]}: ${FLEET_DEFINITIONS[i]["length"]}`;
    button.addEventListener("click", () => {
      selectedShip = {
        name: FLEET_DEFINITIONS[i]["name"],
        length: FLEET_DEFINITIONS[i]["length"],
        orientation: "horizontal",
      };
      console.log(`Selected ship: ${selectedShip["name"]}`);
    });
    buttonsContainer.appendChild(button);
  }
  playerOneContainer.appendChild(buttonsContainer);
}

export {
  createBoard,
  updatePlayerOneBoard,
  updatePlayerTwoBoard,
  setPlayersContainers,
  addFleetButtons,
};
