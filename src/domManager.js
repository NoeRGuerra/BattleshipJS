import Ship from "./Ship";
import { FLEET_DEFINITIONS, BOARD_HEIGHT, BOARD_WIDTH } from "./gameConfig";

let selectedShip = null;
let lastPreviewedCells = [];
let boundHandlePlacementClick = null;
let boundHandlePlacementMouseover = null;
let boundHandleAttackClick = null;
let lastHoveredCell = null;

function setPlayersContainers() {
  const boardsContainer = document.querySelector("#boards-container");
  const playerOneContainer = document.createElement("div");
  playerOneContainer.setAttribute("id", "player-one-container");
  const playerTwoContainer = document.createElement("div");
  playerTwoContainer.setAttribute("id", "player-two-container");
  boardsContainer.append(playerOneContainer);
  boardsContainer.append(playerTwoContainer);
}

function createBoard(player, parentContainer, label) {
  const boardWrapper = document.createElement("div");
  boardWrapper.classList.add("board-wrapper");

  const [width, height] = player.gameboard.size;
  const boardTable = document.createElement("table");

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));
  for (let column = 0; column < width; column++) {
    const tableHeader = document.createElement("th");
    tableHeader.textContent = column + 1;
    tableHeader.classList.add("board-label");
    headerRow.appendChild(tableHeader);
  }
  boardTable.appendChild(headerRow);

  for (let row = 0; row < height; row++) {
    const tableRow = document.createElement("tr");
    const columnHeader = document.createElement("th");
    columnHeader.textContent = String.fromCharCode(65 + row);
    columnHeader.classList.add("board-label");
    tableRow.appendChild(columnHeader);
    for (let column = 0; column < width; column++) {
      const tableCell = document.createElement("td");
      tableCell.setAttribute("data-x", `${column}`);
      tableCell.setAttribute("data-y", `${row}`);
      tableRow.appendChild(tableCell);
    }
    boardTable.appendChild(tableRow);
  }
  const boardLabel = document.createElement("p");
  boardLabel.classList.add("player-label");
  boardLabel.textContent = label;
  parentContainer.appendChild(boardLabel);
  boardWrapper.appendChild(boardTable);
  parentContainer.appendChild(boardWrapper);
  return boardTable;
}

function addPlacementListeners(
  playerBoardElement,
  playerObject,
  handlePlacementClickCallback,
  handlePlacementMouseoverCallback,
  onShipPlacementCallback,
) {
  boundHandlePlacementClick = (event) => {
    if (event.target.tagName === "TD") {
      const row = parseInt(event.target.dataset.y);
      const column = parseInt(event.target.dataset.x);
      handlePlacementClickCallback(
        playerObject,
        [row, column],
        playerBoardElement,
        onShipPlacementCallback,
      );
    }
  };
  playerBoardElement.addEventListener("click", boundHandlePlacementClick);

  boundHandlePlacementMouseover = (event) => {
    if (event.target.tagName === "TD") {
      handlePlacementMouseoverCallback(event, playerObject.gameboard);
    }
  };
  playerBoardElement.addEventListener(
    "mouseover",
    boundHandlePlacementMouseover,
  );

  playerBoardElement.addEventListener("mouseleave", clearPreview);
}

function addAttackListeners(
  opponentBoardElement,
  handleAttackClick,
  opponentPlayer,
  isComputerBoard = true,
) {
  boundHandleAttackClick = (event) => {
    if (event.target.tagName !== "TD") {
      return;
    }
    if (selectedShip) {
      return;
    }
    let coordinates = [
      parseInt(event.target.dataset.y, 10),
      parseInt(event.target.dataset.x, 10),
    ];
    handleAttackClick(
      coordinates,
      opponentPlayer,
      opponentBoardElement,
      isComputerBoard,
    );
  };
  opponentBoardElement.addEventListener("click", boundHandleAttackClick);
}

function removePlacementListeners(playerBoardElement) {
  playerBoardElement.removeEventListener("click", boundHandlePlacementClick);
  playerBoardElement.removeEventListener(
    "mouseover",
    boundHandlePlacementMouseover,
  );
  playerBoardElement.removeEventListener("mouseleave", clearPreview);
}

function handlePlayerPlacementClick(
  playerObject,
  coordinates,
  boardTable,
  onShipPlacementCallback,
) {
  const [row, column] = coordinates;
  const clickedCell = playerObject.gameboard.board[row][column];
  if (clickedCell instanceof Ship && !selectedShip) {
    let shipOrientation = "horizontal";
    let clickIndex = 0;

    for (let r = 0; r < playerObject.gameboard.size[1]; r++) {
      let originFound = false;
      for (let c = 0; c < playerObject.gameboard.size[0]; c++) {
        if (playerObject.gameboard.board[r][c] === clickedCell) {
          if (
            r + 1 < playerObject.gameboard.size[1] &&
            playerObject.gameboard.board[r + 1][c] === clickedCell
          ) {
            shipOrientation = "vertical";
            clickIndex = row - r;
          } else {
            shipOrientation = "horizontal";
            clickIndex = column - c;
          }
          originFound = true;
          break;
        }
      }
      if (originFound) {
        break;
      }
    }
    playerObject.gameboard.removeShip(clickedCell);
    selectedShip = {
      name: "Ship",
      length: clickedCell.length,
      orientation: shipOrientation,
      clickIndex: clickIndex,
    };
    console.log(`Picked up ship of length ${selectedShip.length}`);
    updateBoard(playerObject, boardTable);
    return;
  }

  if (!selectedShip) {
    return;
  }

  // console.log(
  //   `Placing ${selectedShip["name"]}: ${selectedShip["length"]} on [${row}, ${column}], ${selectedShip["orientation"]}`,
  // );

  let placeRow = row;
  let placeCol = column;
  if (selectedShip.orientation === "horizontal") {
    placeCol -= selectedShip.clickIndex;
  } else {
    placeRow -= selectedShip.clickIndex;
  }

  let result = playerObject.gameboard.placeShip(
    [placeRow, placeCol],
    selectedShip["orientation"],
    selectedShip["length"],
  );
  console.log(`result = ${result}`);
  if (result === "placed") {
    const buttons = document.querySelectorAll(".buttons-container button");
    const selectedShipBtn = Array.from(buttons).find((button) =>
      button.textContent.includes(selectedShip["name"]),
    );
    if (selectedShipBtn) {
      selectedShipBtn.remove();
      onShipPlacementCallback();
    }
    selectedShip = null;
    updateBoard(playerObject, boardTable);
  }
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
  const tableBoard = document.querySelector(
    "#player-one-container .board-wrapper table",
  );
  return updateBoard(player, tableBoard);
}

function updatePlayerTwoBoard(player, isComputerBoard) {
  const tableBoard = document.querySelector(
    "#player-two-container .board-wrapper table",
  );
  return updateBoard(player, tableBoard, isComputerBoard);
}

function addFleetButtons(randomizeCallback) {
  const playerOneContainer = document.querySelector("#player-one-container");
  const buttonsContainer = document.createElement("div");
  buttonsContainer.setAttribute("class", "buttons-container");
  for (let i = 0; i < FLEET_DEFINITIONS.length; i += 1) {
    const button = document.createElement("button");
    button.classList.add("fleet-button");
    button.textContent = `${FLEET_DEFINITIONS[i]["name"]}: ${FLEET_DEFINITIONS[i]["length"]}`;
    button.addEventListener("click", () => {
      selectedShip = {
        name: FLEET_DEFINITIONS[i]["name"],
        length: FLEET_DEFINITIONS[i]["length"],
        orientation: "horizontal",
        clickIndex: 0,
      };
      console.log(`Selected ship: ${selectedShip["name"]}`);
    });
    buttonsContainer.appendChild(button);
  }
  const rotateButton = document.createElement("button");
  rotateButton.classList.add("rotate-button");
  rotateButton.addEventListener("click", rotateSelectedShip);
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && selectedShip) {
      event.preventDefault();
      rotateSelectedShip();
    }
  });
  rotateButton.textContent = "🔄️ Rotate 🔄️";
  const randomizeButton = document.createElement("button");
  randomizeButton.classList.add("randomize-button");
  randomizeButton.textContent = "Random";
  randomizeButton.addEventListener("click", randomizeCallback);
  buttonsContainer.appendChild(randomizeButton);
  buttonsContainer.appendChild(rotateButton);
  playerOneContainer.appendChild(buttonsContainer);
}

function rotateSelectedShip() {
  if (!selectedShip) {
    return;
  }
  let currentOrientation = selectedShip["orientation"];
  selectedShip["orientation"] =
    currentOrientation == "horizontal" ? "vertical" : "horizontal";
  console.log(`Ship orientation: ${selectedShip["orientation"]}`);

  if (lastHoveredCell) {
    lastHoveredCell.dispatchEvent(
      new MouseEvent("mouseover", {
        bubbles: true,
        cancelable: true,
      }),
    );
  }
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
  lastHoveredCell = event.target;
  if (!selectedShip) {
    return;
  }

  const gridContainer = document.querySelector("#player-one-container");

  clearPreview();
  const currentCell = event.target;
  let startX = parseInt(currentCell.dataset.x);
  let startY = parseInt(currentCell.dataset.y);

  if (selectedShip.orientation === "horizontal") {
    startX -= selectedShip.clickIndex;
  } else {
    startY -= selectedShip.clickIndex;
  }

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
  phaseElement.textContent = `Current phase: ${currentPhase[0].toUpperCase() + currentPhase.slice(1)}`;
}

function displayStatus(message) {
  const statusLabel = document.querySelector(".status-label");
  statusLabel.textContent = message;
}

function setupInterface() {
  const bodyElement = document.querySelector("body");
  const labelsContainer = document.createElement("div");
  labelsContainer.classList.add("labels");

  const statusLabel = document.createElement("p");
  statusLabel.className = "status-label";
  statusLabel.textContent = "It's your turn";
  labelsContainer.appendChild(statusLabel);

  const phaseElement = document.createElement("p");
  phaseElement.classList.add("phaseText");
  labelsContainer.appendChild(phaseElement);

  const instructionsContainer = document.createElement("div");
  instructionsContainer.classList.add("instructions");
  const instructions = [
    "Press Space to rotate the ship you are placing.",
    "Click on a placed ship to move it to another location.",
  ];
  for (let instruction of instructions) {
    const instructionLabel = document.createElement("p");
    instructionLabel.textContent = instruction;
    instructionsContainer.appendChild(instructionLabel);
  }
  labelsContainer.appendChild(instructionsContainer);

  bodyElement.appendChild(labelsContainer);
}

function showGameOverScreen(winnerText, restartCallback) {
  const body = document.querySelector("body");
  const overlay = document.createElement("div");
  overlay.classList.add("game-over-overlay");
  const messageBox = document.createElement("div");
  messageBox.classList.add("messageBox");
  const winnerLabel = document.createElement("p");
  winnerLabel.textContent = winnerText;
  winnerLabel.classList.add("winner-label");
  const restartButton = document.createElement("button");
  restartButton.classList.add("start-button");
  restartButton.textContent = "Restart game";
  restartButton.addEventListener("click", restartCallback);
  messageBox.appendChild(winnerLabel);
  messageBox.appendChild(restartButton);
  overlay.appendChild(messageBox);
  body.appendChild(overlay);
}

function removeGameOverScreen() {
  const overlay = document.querySelector(".game-over-overlay");
  if (overlay) {
    overlay.remove();
  }
}

function clearButtons() {
  const buttonsContainer = document.querySelector(".buttons-container");
  if (buttonsContainer) {
    buttonsContainer.remove();
  }
}

function createStartButtonOverlay(startCallback) {
  const opponentContainer = document.querySelector(
    "#player-two-container .board-wrapper",
  );
  if (opponentContainer.querySelector(".board-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.classList.add("board-overlay");

  const startButton = document.createElement("button");
  startButton.textContent = "Start";
  startButton.classList.add("start-button");
  startButton.addEventListener("click", startCallback);

  overlay.appendChild(startButton);
  opponentContainer.appendChild(overlay);
}

function removeStartButtonOverlay() {
  const overlay = document.querySelector(".board-overlay");
  if (overlay) {
    overlay.remove();
  }
}

function removeInstructions() {
  const instructionsContainer = document.querySelector(".instructions");
  instructionsContainer.remove();
}

function addDarkModeBtn() {
  const darkModeBtn = document.createElement("button");
  darkModeBtn.textContent = "🌙️";
  darkModeBtn.classList.add("dark-mode-btn");
  darkModeBtn.addEventListener("click", toggleDarkMode);

  const body = document.querySelector("body");
  body.appendChild(darkModeBtn);
}

function toggleDarkMode(event) {
  const body = document.querySelector("body");
  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");
  event.target.textContent = isDarkMode ? "☀️" : "🌙️";
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
  displayStatus,
  addPlacementListeners,
  handlePlayerPlacementClick,
  handleCellMouseover,
  addAttackListeners,
  removePlacementListeners,
  showGameOverScreen,
  removeGameOverScreen,
  clearButtons,
  setBoardClickable,
  createStartButtonOverlay,
  removeStartButtonOverlay,
  addDarkModeBtn,
  removeInstructions,
};
