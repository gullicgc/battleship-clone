"use strict";

/* Variables tracking status of player and computer ships. */	
var compShips = 5,
	playerShips = 5;

/* Variables defining initial values for ship number in HTML. */	
var carNum = 1,
	batNum = 1,
	cruNum = 1,
	subNum = 1,
	desNum = 1,
	shipSum = carNum + batNum + cruNum + subNum + desNum;

/** Ship object constructor. Contains ship, state, and size.
 * @constructor
 */
function Ship(name) {
	var type;
	switch(name) {
		case "car":
			type = { name: 'carrier', abbr: 'car', size: 5, hits: 0, sunk: false };
			break;
		case "bat":
			type = { name: 'battleship', abbr: 'bat', size: 4, hits: 0, sunk: false };
			break;
		case "cru":
			type = { name: 'cruiser', abbr: 'cru', size: 3, hits: 0, sunk: false };
			break;
		case "sub":
			type = { name: 'submarine', abbr: 'sub', size: 3, hits: 0, sunk: false };
			break;
		case "des":
			type = { name: 'destroyer', abbr: 'des', size: 2, hits: 0, sunk: false };
			break;
		case "":
			type = { name: '', abbr: '', size: 1, hits: 0, sunk: false };
			break;
		default:
			console.log("Error: Ship type not recognised. Ship type: " + name);
			break;
	}

	this.name = type.name;
	this.abbr = type.abbr;
	this.size = type.size;
	this.hits = type.hits;
	this.sunk = function() {
		return this.size == this.hits;
	};
	
	/* Custom hash for Ship object comparison. */
	this.hashCode = function() {
		var hash = 1,
			character;
		
		hash = hash * 17 + this.size; // use prime 17 to include size
		hash = hash * 13 + this.hits; // use prime 13 to include hits
		hash = hash * 31 + this.sunk; // use prime 31 to include sunk (0 or 1)
		
		if (this.name.length !== 0) {
			/* Take each string char and hash. */
			for (var i = 0; i < this.name.length; i++) {
				character = this.name.charCodeAt(i); // convert char at i to ascii number
				hash = hash * 23 + character; // use prime 31 for each char
				hash = hash & hash; // Limit to 32 bit integer (prevent hitting Infinity)
			}
		}

		return hash;
	};
}

/* Function sends all global ship counts to HTML elements. */
function updateHtmlShipCount(){
	$("carNum").innerHTML = carNum;
	$("batNum").innerHTML = batNum;
	$("cruNum").innerHTML = cruNum;
	$("subNum").innerHTML = subNum;
	$("desNum").innerHTML = desNum;
	if (shipSum === 0) {
		$("randomBoard").disabled = true;
	}
}

/* Function determines number of ships the player has left to assign.
 * Takes a Ship object parameter.
 * Returns number of ship type left to assign.
 */
function getShipCount(shipType) {
	var count;

	switch(shipType.abbr) {
		case "car":
			count = carNum;
			break;
		case "bat":
			count = batNum;
			break;
		case "cru":
			count = cruNum;
			break;
		case "sub":
			count = subNum;
			break;
		case "des":
			count = desNum;
			break;
		default:
			console.log("Error: Ship type not recognised in getShipCount. Ship type: " + shipType);
			break;
	}

	return count;
}

/* Function updates the ship count. Takes parameter as a Ship object and a
 * number. Count and HTML are updated based on the count passed.
 * When ship is used, HTML element is disabled and check removed.
 * Note: Only implemented to use count = -1.
 */
function setShipCount(shipType, count) {
	switch(shipType.abbr) {
		case "car":
			if (carNum + count === 0 || carNum + count == 1) {
				carNum += count;
				$("carrier").disabled = true;
				$("carrier").checked = false;
			}
			break;
		case "bat":
			if (batNum + count === 0 || batNum + count == 1) {
				batNum += count;
				$("battleship").disabled = true;
				$("battleship").checked = false;				
			}
			break;
		case "cru":
			if (cruNum + count === 0 || cruNum + count == 1) {
				cruNum += count;
				$("cruiser").disabled = true;
				$("cruiser").checked = false;
			}
			break;
		case "sub":
			if (subNum + count === 0 || subNum + count == 1) {
				subNum += count;
				$("submarine").disabled = true;
				$("submarine").checked = false;
			}
			break;
		case "des":
			if (desNum + count === 0 || desNum + count == 1) {
				desNum += count;
				$("destroyer").disabled = true;
				$("destroyer").checked = false;
			}
			break;
		default:
			console.log("Error: Ship type not recognised in setShipCount. Ship type: " + shipType);
			break;
	}

	/* Move check to unchecked radio option. */
	var length = document.placeShip.shipType.length;
	for (var i = 0; i < length; i++){
		if (document.placeShip.shipType[i].disabled === false) {
			document.placeShip.shipType[i].checked = true;
		}
	}
	shipSum = carNum + batNum + cruNum + subNum + desNum;
	updateHtmlShipCount();
}

/* Function updates boards and displays all attacks. Takes parameter Cell 
 * object. Returns true if attack succeeded, false if not.
 */
function attackCell(cell) {
	var cellHit = false;
	var myBoard = board.getBoard(cell.player),
		target = myBoard[cell.row][cell.col],
		x = (cell.player == 'player') ? cell.col * board.cellSize + board.startX1 + (board.cellSize / 2) : cell.col * board.cellSize + board.startX2 + (board.cellSize / 2),
		y = (cell.player == 'player') ? cell.row * board.cellSize + board.startY1 + (board.cellSize / 2) : cell.row * board.cellSize + board.startY2 + (board.cellSize / 2),
		radius = 10;
	switch (target.state) {
		/* Cell is empty. */ 
		case 1:
			myBoard[cell.row][cell.col].state = board.cellEmptyHit;
			displayAttack(x, y, radius, '255, 255, 255');
			if (cell.player == 'computer') {
				updateOutput("Player missed.");
			} else {
				updateOutput("");
			}
			break;

		/* Cell has a ship. */
		case 2:
			shipHit(cell);
			cellHit = true;
			myBoard[cell.row][cell.col].state = board.cellShipHit;
			displayAttack(x, y, radius, '255, 0, 0');
			if (cell.player == 'computer') {
				updateOutput("Player hit a " + target.ship.name + ".");
			} else {
				updateOutput("");
			}
			break;
			
		/* Cell has a hit ship. */ 
		case 3:
			break;
		case 4:
		/* Cell has a missed attack. */
			break;
		default:
			console.log("Error: array value not recognised; should be 1-4. Found : " + target + ", Index: [" + cell.row + "][" + cell.col + "]");
			break;
	}

	return cellHit;
}

/* Function can be used to track down a ship on a board based on the board cell
 * passed. Takes Cell object.
 * Returns Ship object at passed cell location.
 */
function findShip(cell) {
	var myBoard = board.getBoard(cell.player);
	
	return myBoard[cell.row][cell.col].ship; // ship at passed cell
}

/* Function handles updating board and global variables when a ship is hit.
 * Takes parameter Cell object.
 */
function shipHit(cell) {
	var myBoard = board.getBoard(cell.player),
		target = myBoard[cell.row][cell.col].ship,
		radius = 5,
		offset = board.imgSize + board.imgMargin,
		x = 0,
		y;

	target.hits++;

	/* Add 15px spacing for each hit. */
	for (var i = 1; i < target.hits; i++) { x += 15; }

	switch (target.abbr) {
		case "car":
			x += 95;
			y = 65;
			break;
		case "bat":
			x += 62;
			y = 95;
			break;
		case "cru":
			x += 62;
			y = 126;
			break;
		case "sub":
			x += 155;
			y = 126;
			break;
		case "des":
			x += 175;
			y = 95;
			break;
		default:
			console.log("Error: Ship type not recognised in shipHit. Ship type: " + name);
			break;
	}

	if (cell.player == 'player') {
		displayAttack(x, y, radius, '255, 0, 0');

		/* See if a player ship sunk and update global. */
		if (target.sunk()){ playerShips--; }
	} else {
		displayAttack(x + offset, y, radius, '255, 0, 0');

		/* See if a computer ship sunk and update global. */
		if (target.sunk()) { compShips--; }
	}
}