// index.js
import "./styles.css";
import Player from "./Player";
import { FLEET_DEFINITIONS, BOARD_HEIGHT, BOARD_WIDTH } from "./gameConfig";
import {
  addFleetButtons,
  createBoard,
  setPlayersContainers,
  updatePlayerOneBoard,
  updatePlayerTwoBoard,
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
} from "./domManager";

// let width = prompt("Enter board size:");
// // let width = 10;
// while (!isInputValid(width)) {
//   alert("Invalid input, try again.");
//   width = prompt("Enter board size:");
// }

// function isInputValid(input) {
//   if (isNaN(input) || parseInt(input) < 5) {
//     return false;
//   }
//   return true;
// }

const playerOne = new Player("real", BOARD_WIDTH, BOARD_HEIGHT);
const playerTwo = new Player("computer", BOARD_WIDTH, BOARD_HEIGHT);
let currentPlayer = playerOne;
let opponentPlayer = playerTwo;
let gameActive = false;
let gamePhase = "placement";
let humanPlayerShipsToPlace = FLEET_DEFINITIONS.length;

function setupFleet(player, fleetDefinitions) {
  for (let i = 0; i < fleetDefinitions.length; i += 1) {
    const result = player.gameboard.placeShip(
      [i, 4],
      "horizontal",
      fleetDefinitions[i]["length"],
    );
    if (result !== "placed") {
      console.log(`Error: ${result}`);
    } else {
      console.log(
        `${fleetDefinitions[i]["name"]} placed for ${player.type} player`,
      );
      player.gameboard.printBoard();
    }
  }
}

function switchTurns() {
  if (opponentPlayer.gameboard.areAllShipsSunk()) {
    console.log("All ships are sunk!");
    endGame(currentPlayer);
    return;
  }
  [currentPlayer, opponentPlayer] = [opponentPlayer, currentPlayer];
  if (currentPlayer.type == "computer") {
    handleComputerAttack();
    // setTimeout(handleComputerAttack, 500);
  }
  console.log(`currentPlayer=${currentPlayer.type}`);
}

function handleRandomizeClick() {
  playerOne.gameboard.clear();
  playerOne.gameboard.placeShipsRandomly();
  updatePlayerOneBoard(playerOne);
  const buttonsContainer = document.querySelector(".buttons-container");
  buttonsContainer.remove();
  transitionToBattlePhase(playerOneContainer.querySelector("table"));
}

function handlePlayerAttack(
  coordinates,
  targetPlayer,
  boardElement,
  isComputerBoard = true,
) {
  if (
    targetPlayer !== opponentPlayer ||
    !gameActive ||
    currentPlayer.type != "real"
  ) {
    // Reject attack if it's not the user's turn
    console.log("Not your turn!");
    return;
  }

  if (targetPlayer !== opponentPlayer) {
    console.error("Attempted to attack non-opponent board");
    return;
  }
  const result = targetPlayer.gameboard.receiveAttack(coordinates);
  if (result === "hit" || result === "sunk" || result === "miss") {
    updateBoard(targetPlayer, boardElement, isComputerBoard);
    displayStatus(
      `Attack result on [${coordinates[0]}, ${coordinates[1]}]: ${result}`,
    );
    switchTurns();
  } else {
    displayStatus("Invalid move. Try again.");
  }
}

function handleComputerAttack() {
  const result = currentPlayer.makeRandomAttack(opponentPlayer.gameboard);
  if (result === "Max attempts reached") {
    console.log("Error, max attempts reached");
    return;
  }
  console.log(`Computer attack: ${result}`);
  const attackedCoords =
    currentPlayer.gameboard.attackedCoordinates[
      currentPlayer.gameboard.attackedCoordinates.length - 1
    ];
  displayStatus(`Computer attacked [${attackedCoords}]: ${result}!`);
  updateBoard(opponentPlayer, playerOneContainer.querySelector("table"), false);
  switchTurns();
}

function endGame(winner) {
  console.log("Game over!");
  gameActive = false;
  gamePhase = "game_over";
  const winnerName = winner.type === "real" ? "Player" : "Computer";
  displayPhase("Game over!");
  showGameOverScreen(`${winnerName} wins!`, resetGame);
}

function handleShipPlacedCallback() {
  humanPlayerShipsToPlace -= 1;
  console.log(`humanPlayerShipsToPlace = ${humanPlayerShipsToPlace}`);
  if (humanPlayerShipsToPlace == 0) {
    transitionToBattlePhase(playerOneContainer.querySelector("table"));
  }
}

function transitionToBattlePhase(playerBoardElement) {
  gamePhase = "battle";
  displayPhase(gamePhase);
  gameActive = true;
  removePlacementListeners(playerBoardElement);
  console.log("Battle!");
  addAttackListeners(
    playerTwoContainer.querySelector("table"),
    handlePlayerAttack,
    opponentPlayer,
    true,
  );
}

function resetGame() {
  gameActive = false;
  gamePhase = "placement";
  playerOne.gameboard.clear();
  playerTwo.gameboard.clear();
  currentPlayer = playerOne;
  opponentPlayer = playerTwo;
  playerTwo.gameboard.placeShipsRandomly();
  removeGameOverScreen();
  updatePlayerOneBoard(playerOne);
  updatePlayerTwoBoard(playerTwo, true);
  displayPhase(gamePhase);
  displayStatus("Place your ships or click 'random'");
  clearButtons();
  addFleetButtons(handleRandomizeClick);
  addPlacementListeners(
    playerOneContainer.querySelector("table"),
    playerOne,
    handlePlayerPlacementClick,
    handleCellMouseover,
    handleShipPlacedCallback,
  );
}

setPlayersContainers();
const playerOneContainer = document.querySelector("#player-one-container");
const playerTwoContainer = document.querySelector("#player-two-container");
playerTwo.gameboard.placeShipsRandomly();
createBoard(playerOne, playerOneContainer, "Player");
createBoard(playerTwo, playerTwoContainer, "Opponent");
updatePlayerOneBoard(playerOne);
updatePlayerTwoBoard(playerTwo, true);
addFleetButtons(handleRandomizeClick);
setupInterface();
displayPhase(gamePhase);
addPlacementListeners(
  playerOneContainer.querySelector("table"),
  playerOne,
  handlePlayerPlacementClick,
  handleCellMouseover,
  handleShipPlacedCallback,
);
