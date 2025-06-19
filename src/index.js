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
  if (
    currentPlayer.gameboard.areAllShipsSunk ||
    opponentPlayer.gameboard.areAllShipsSunk
  ) {
    gameActive = false;
    console.log("All ships are sunk!");
    endGame();
  }
  [currentPlayer, opponentPlayer] = [opponentPlayer, currentPlayer];
  if (currentPlayer.type == "computer") {
    handleComputerAttack();
  }
  console.log(`currentPlayer=${currentPlayer.type}`);
}

function handlePlayerAttack(
  coordinates,
  player,
  boardElement,
  isComputerBoard = true,
) {
  // if (player === currentPlayer) {
  //   // Reject attack if it's not the user's turn
  //   console.log("Not your turn!");
  //   return;
  // }
  const result = player.gameboard.receiveAttack(coordinates);
  if (result === "hit" || result === "sunk" || result === "miss") {
    updateBoard(player, boardElement, isComputerBoard);
    switchTurns();
  }
}

function handleComputerAttack() {
  const result = currentPlayer.makeRandomAttack(opponentPlayer.gameboard);
  if (result === "Max attempts reached") {
    console.log("Error, max attempts reached");
    return;
  }
  console.log(`Computer attack: ${result}`);
  updateBoard(opponentPlayer, playerOneContainer.querySelector("table"), false);
  switchTurns();
}

function endGame() {
  console.log("Game over!");
}

setPlayersContainers();
const playerOneContainer = document.querySelector("#player-one-container");
const playerTwoContainer = document.querySelector("#player-two-container");
setupFleet(playerTwo, FLEET_DEFINITIONS);
createBoard(playerOne, playerOneContainer, false, () => {}, "Player");
createBoard(
  playerTwo,
  playerTwoContainer,
  true,
  handlePlayerAttack,
  "Opponent",
);
updatePlayerOneBoard(playerOne);
updatePlayerTwoBoard(playerTwo, true);
addFleetButtons();
setupInterface();
displayPhase(gamePhase);
