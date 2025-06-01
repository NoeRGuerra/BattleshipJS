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

setPlayersContainers();
const playerOneContainer = document.querySelector("#player-one-container");
const playerTwoContainer = document.querySelector("#player-two-container");
// setupFleet(playerOne, FLEET_DEFINITIONS);
// setupFleet(playerTwo, FLEET_DEFINITIONS);
createBoard(playerOne, playerOneContainer);
createBoard(playerTwo, playerTwoContainer, true);
updatePlayerOneBoard(playerOne);
updatePlayerTwoBoard(playerTwo, true);
addFleetButtons();
