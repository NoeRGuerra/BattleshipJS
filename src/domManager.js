import Ship from "./Ship";
import { FLEET_DEFINITIONS, BOARD_HEIGHT, BOARD_WIDTH } from "./gameConfig";
// For now, focus only on player vs computer

let selectedShip = null;
let lastPreviewedCells = [];

function setPlayersContainers() {
  const boardsContainer = document.querySelector("#boards-container");
  const playerOneContainer = document.createElement("div");
  playerOneContainer.setAttribute("id", "player-one-container");
  const playerTwoContainer = document.createElement("div");
  playerTwoContainer.setAttribute("id", "player-two-container");
  boardsContainer.append(playerOneContainer);
  boardsContainer.append(playerTwoContainer);
}

function createBoard(
  player,
  parentContainer,
  isComputerBoard = false,
  attackCallback,
  label,
) {
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
            }
          }
        });
        tableCell.addEventListener("mouseover", handleCellMouseover);
      } else {
        // Add event listener to computer's board to receive attacks from user
        tableCell.addEventListener("click", () => {
          if (selectedShip) {
            return;
          }
          let coordinates = [row, column];
          attackCallback(coordinates, player, boardTable, isComputerBoard);
        });
      }
      tableRow.appendChild(tableCell);
      boardTable.appendChild(tableRow);
    }
  }
  const boardLabel = document.createElement("p");
  boardLabel.classList.add("player-label");
  boardLabel.textContent = label;
  parentContainer.appendChild(boardLabel);
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
      cell.classList.remove("hit", "miss", "ship", "sunk"); // Clear styles before applying new
      if (
        missedAttacks.some((coord) => coord[0] === row && coord[1] === column)
      ) {
        cell.classList.add("miss");
      } else if (
        hits.some((coord) => coord[0] === row && coord[1] === column)
      ) {
        cell.classList.add("hit");
      }
      if (
        playerBoard[row][column] instanceof Ship &&
        !isComputerBoard &&
        !playerBoard[row][column].isSunk()
      ) {
        cell.classList.add("ship");
      } else if (
        playerBoard[row][column] instanceof Ship &&
        playerBoard[row][column].isSunk()
      ) {
        cell.classList.add("sunk");
      }
    }
  }
}

function updatePlayerOneBoard(player) {
  const tableBoard = document.querySelector("#player-one-container>table");
  return updateBoard(player, tableBoard);
}

function updatePlayerTwoBoard(player, isComputerBoard) {
  const tableBoard = document.querySelector("#player-two-container>table");
  return updateBoard(player, tableBoard, isComputerBoard);
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
  const rotateButton = document.createElement("button");
  rotateButton.addEventListener("click", () => {
    if (!selectedShip) {
      return;
    }
    let currentOrientation = selectedShip["orientation"];
    selectedShip["orientation"] =
      currentOrientation == "horizontal" ? "vertical" : "horizontal";
    console.log(`Ship orientation: ${selectedShip["orientation"]}`);
  });
  rotateButton.textContent = "🔄️ Rotate 🔄️";
  buttonsContainer.appendChild(rotateButton);
  playerOneContainer.appendChild(buttonsContainer);
}

function calculateCells(startX, startY, length, orientation) {
  const cells = [];
  for (let i = 0; i < length; i++) {
    if (orientation == "horizontal") {
      cells.push({ x: startX + i, y: startY });
    } else {
      cells.push({ x: startX, y: startY + i });
    }
  }
  return cells;
}

function handleCellMouseover(event) {
  if (!selectedShip) {
    return;
  }

  const gridContainer = document.querySelector("#player-one-container");

  clearPreview();
  const currentCell = event.target;
  const startX = parseInt(currentCell.dataset.x);
  const startY = parseInt(currentCell.dataset.y);

  const cellsCoords = calculateCells(
    startX,
    startY,
    selectedShip["length"],
    selectedShip["orientation"],
  );

  const placementIsValid = isValidPlacement(cellsCoords);
  const previewClass = placementIsValid ? "preview" : "preview-invalid";

  cellsCoords.forEach((coord) => {
    const cell = gridContainer.querySelector(
      `[data-x="${coord.x}"][data-y="${coord.y}"]`,
    );
    if (cell) {
      cell.classList.add(previewClass);
      lastPreviewedCells.push(cell);
    }
  });
}

function clearPreview() {
  lastPreviewedCells.forEach((cell) => {
    cell.classList.remove("preview", "preview-invalid");
  });
  lastPreviewedCells = [];
}

function setBoardClickable(boardElement, clickable) {
  if (clickable) {
    boardElement.classList.remove("disabled-board");
  } else {
    boardElement.classList.add("disabled-board");
  }
}

function isValidPlacement(cells) {
  const gridContainer = document.querySelector("#player-one-container");
  for (const { x, y } of cells) {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
      return false;
    }
    const cellElement = gridContainer.querySelector(
      `[data-x="${x}"][data-y="${y}"]`,
    );
    if (cellElement && cellElement.classList.contains("ship")) {
      return false;
    }
  }
  return true;
}

function displayPhase(currentPhase) {
  const phaseElement = document.querySelector(".phaseText");
  phaseElement.textContent = `Current phase: ${currentPhase}`;
}

function setupInterface() {
  const bodyElement = document.querySelector("body");
  const labelsContainer = document.createElement("div");
  labelsContainer.classList.add("labels");
  const phaseElement = document.createElement("p");
  phaseElement.classList.add("phaseText");
  labelsContainer.appendChild(phaseElement);
  bodyElement.appendChild(labelsContainer);
}

export {
  createBoard,
  updatePlayerOneBoard,
  updatePlayerTwoBoard,
  setPlayersContainers,
  addFleetButtons,
  updateBoard,
  setupInterface,
  displayPhase,
};
