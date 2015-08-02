
var computer = new AI();
var board = new Board();

/* Variables related to canvas board coordinates. */	
function Board() {
	this.size = 10; // number of cells per board side
	this.imgMargin = 40; 
	this.imgSize = 180; // square 180px x 180px (10 cells 18 x 18)
	this.cellSize = this.imgSize / this.size; // size of a cell in pixels (18 x 18px)
	this.startY1 = 160; 
	this.startX1 = 30; 
	this.startY2 = 160; 
	this.startX2 = this.startX1 + this.imgSize + this.imgMargin;
	this.endX1 = this.imgSize + this.startX1;
	this.endY1 = this.imgSize + this.startY1;
	this.endX2 = this.endX1 + this.imgMargin + this.imgSize;
	this.endY2 = this.endY1;
	
	/* Variables defining ship (coordinate) state settings. */
	this.cellEmpty = 1;
	this.cellShip = 2;
	this.cellShipHit = 3;
	this.cellEmptyHit = 4;
	
	/* Arrays containing the current board status. Each element is a board cell. */	
	var computerBoardStatus = new Array(this.size), playerBoardStatus = new Array(this.size);
	
	for (var i = 0; i < this.size; i++) {
		computerBoardStatus[i] = new Array(this.size);
		playerBoardStatus[i] = new Array(this.size);
		for (var j = 0; j < this.size; j++) {
			computerBoardStatus[i][j] = { ship: new Ship(""), state: this.cellEmpty };
			playerBoardStatus[i][j] = { ship: new Ship(""), state: this.cellEmpty };
		}
	}
	
	/* Function determines if a cell can be attacked. Takes parameter Cell object.
	 * Returns true if cell is attackable, false if not.
	 */
	this.isCellAttackable = function(cell) {
		var retVal = false;
		if(cell.row >= 0 && cell.row <= 9 && cell.col >= 0 && cell.col <= 9) {
			var myBoard = board.getBoard(cell.player),
				target = myBoard[cell.row][cell.col];
			switch (target.state) {
				case 1:
					retVal = true;
					break;
				case 2:
					retVal = true;
					break;
				case 3:
					retVal = false;
					break;
				case 4:
					retVal = false;
					break;
				default:
					console.log("Error: array index value not recognised; should be 1-4. Found : " + target.state + ", Index: [" + cell.row + "][" + cell.col + "]");
					break;
			}
		}
		return retVal;
	};

	/* Function determines if a cell is not empty. Takes parameter Cell object.
	 * Returns true if cell is occupied by ship, hit ship, or attack. False if not.
	 */
	this.isCellOccupied = function(cell) {
		var myBoard = this.getBoard(cell.player),
			target = myBoard[cell.row][cell.col],
			retVal;
		switch (target.state) {
			case 1:
				retVal = false;
				break;
			case 2:
				retVal = true;
				break;
			case 3:
				retVal = true;
				break;
			case 4:
				retVal = true;
				break;
			default:
				console.log("Error: array index value not recognised; should be 1-4. Found : " + target + ", Index: [" + cell.row + "][" + cell.col + "]");
				break;
		}

		return retVal;
	};

	/* Function determines if a ship will be placed in a legal position on the board.
	 * Takes parameters Cell object, string, and Ship object.
	 * Returns true for safe position to add a ship, false if not safe. 
	 */
	this.isLegalShipPosition = function(cell, direction, shipType) {
		var size = shipType.size,
			x = cell.col,
			y = cell.row,
			endBoardX = (cell.player == 'player') ? board.endX1 : board.endX2,
			endBoardY = (cell.player == 'player') ? board.endY1 : board.endY2,
			endShipX = (cell.player == 'player') ? (x + (size - 1)) * board.cellSize + board.cellSize : (x + (size - 1)) * board.cellSize + board.cellSize + board.startX2,
			endShipY = (cell.player == 'player') ? (y + (size - 1)) * board.cellSize + board.cellSize : (y + (size - 1)) * board.cellSize + board.cellSize + board.startY2,
			myBoard = this.getBoard(cell.player),
			cellSum = 0,
			retVal = false;

		if (direction == "Horiz") {
			/* Check if ship will go off board. */
			if (endShipX  <= endBoardX && x + size <= this.size ) {
				/* Check if any cell for ship is occupied by summing all ship states. */
				for (var i = x; i < x + size && !board.isCellOccupied(cell); i++){
					cellSum += myBoard[y][i].state !== undefined ? myBoard[y][i].state : 0;
				}

				retVal = (cellSum == size); // if value at all indices is 1, then true (empty) else false
			}
		} else if (direction == "Vert"){
			/* Check if ship will go off board. */
			if (endShipY <= endBoardY && y + size <= this.size) {
				/* Check if any cell for ship is occupied by summing all ship states. */
				for (var i = y; i < y + size && !board.isCellOccupied(cell); i++) {
					cellSum += myBoard[i][x].state !== undefined ? myBoard[i][x].state : 0;
				}

				retVal = (cellSum == size); // if value at all indices is 1, then true (empty) else false
			}
		}
		
		return retVal;
	};

	
	/* Function gets the board for the passed player. Takes parameter string.
	 * Returns reference to board array for passed player.
	 */
	this.getBoard = function(player) {
		return (player == 'player') ? playerBoardStatus : computerBoardStatus;
	};
}

/** Cell object constructor. Contains row, col, and player.  
 * @constructor
 */
function Cell(row, col, player) {
	this.row = row;
	this.col = col;
	this.player = player;
	
	/* Custom hash for Cell object comparison. */
	this.hashCode = function() {
		var hash = 1,
			character;
			
		hash = hash * 17 + this.row; // use prime 17 to include row
		hash = hash * 13 + this.col; // use prime 13 to include row
		
		if (this.player.length !== 0) {
			/* Take each string char and hash. */
			for (var i = 0; i < this.player.length; i++) {
				character = this.player.charCodeAt(i); // convert char at i to ascii number
				hash = hash * 31 + character; // use prime 31 for each char
				hash = hash & hash; // Limit to 32 bit integer (prevent hitting Infinity)
			}
		}
		
		return hash;
	};
}

/* Function that handles all board click events. Parameter click event comes from
 * canvas.addEventListener assigned at window.onload.
 */
function boardOnClick(event){
	var cell = getPosition(event); // identify the location coordinate clicked

	/* Game has not started and player should assign all ships. */
	if(shipSum > 0 && cell.player == 'player' && !gameInProgress){
		var formDirection = document.placeShip.direction,
			formShipName = document.placeShip.shipType;
		var direction, 
			shipType;

		/* Get direction from HTML radio option. */
		for (var i = 0; i < formDirection.length; i++){
			if (formDirection[i].checked) {
				direction = formDirection[i].value;
			}
		}

		/* Get ship from HTML radio option. */
		for (var i = 0; i < formShipName.length; i++){
			if (formShipName[i].checked) {
				shipType = new Ship(formShipName[i].value);
			}
		}

		/* Check if ship has been used and if the click was a legal location. */
		if (getShipCount(shipType) == 1 && board.isLegalShipPosition(cell, direction, shipType)) {
			$("randomBoard").disabled = true;
			updateBoard(cell, direction, shipType, true);
			setShipCount(shipType, -1);
			if(shipSum === 0) {
				updateOutput("Game is ready! Click enemy grid to start.");
			}
		} 
	}

	/* Check if game is ready to start and if clicked coordinate can be attacked. */
	if (shipSum === 0 && !gameWon && cell.player == 'computer' && !gameWon && !gameInProgress && board.isCellAttackable(cell)) {
		gameInProgress = true;
	}

	/* Check if game has started, use click to attack, and let computer attack. */
	if (gameInProgress && cell.player == 'computer' && currentPlayer == 'player' && board.isCellAttackable(cell)) {
		attackCell(cell);
		checkForVictory();
		switchPlayers();
		
		if (!gameWon) {
			/* Timer delay set to allow console output to be read. */
			setTimeout(function(){
							updateOutput("Computer's turn.");		
							setTimeout(function(){
											computer.move();
											updateOutput("Player's turn.");
											checkForVictory();
											switchPlayers();
										}, 500);
			}, 500);
		}
	}	
}

/* Function to update the board arrays. Takes parameters of Cell object, 
 * string, Ship object, and boolean. Boolean parameter true displays the ship */
function updateBoard(cell, direction, shipType, display) {
	var size = shipType.size,
		myBoard = board.getBoard(cell.player);

	/* Populate proper board in passed direction. */
	if (direction == "Horiz") {
		var row = myBoard[cell.row];
		for (var i = cell.col; i < cell.col + size; i++){
			row[i] = { ship: shipType, state: board.cellShip };
		}
	} else if (direction == "Vert"){
		for (var i = cell.row; i < cell.row + size; i++){
			myBoard[i][cell.col] = { ship: shipType, state: board.cellShip };
		}
	}

	/* Call place ship if display is true.  Timeout used to fix a bug
	 * due to multiple placeShips being called to quickly and ships not
	 * displaying.
	 */
	if (display) {
		setTimeout(function() {
			placeShips(cell, direction, shipType);
		}, 100);
	}
}

/* Function uses event from boardOnClick to determine which board and 
 * coordinate was clicked. 
 * Returns a Cell object with the board coordinates (0 based) and board clicked.
 */ 
function getPosition(event) {
	var x, y, cell;

	/* Determine compatible browser and find the point clicked. */
	if (event.x !== undefined && event.y !== undefined){	
		x = event.pageX;
		y = event.pageY;
	} else {
		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	/* Correct coordinate found to indicate position in canvas element. */
	x -= canvas.offsetLeft;	
	y -= canvas.offsetTop;

	/* Boolean variables determining if click was within board boundaries. */
	var inBoundsY1 = (y >= board.startY1 && y <= board.endY1),
		inBoundsY2 = (y >= board.startY2 && y <= board.endY2),
		inBoundsX1 = (x >= board.startX1 && x <= board.endX1),
		inBoundsX2 = (x >= board.startX2 && x <= board.endX2);

	/* Click was within left board (player board). */
	if (inBoundsX1 && inBoundsY1) {
		x -= board.startX1;
		y -= board.startY1;
		cell = new Cell(Math.floor(y/board.cellSize), Math.floor(x/board.cellSize), "player");
	} 

	/* Click was within right board (computer board). */
	if (inBoundsX2 && inBoundsY2) {
		x -= board.startX2;
		y -= board.startY2;
		cell = new Cell(Math.floor(y/board.cellSize), Math.floor(x/board.cellSize), "computer");
	}

	return cell;
}

/* Function generates random board coordinates to build a random board. Takes
 * Takes parameter boolean to control showing (true) or hiding (false) the ships.
 */
function populateBoard(bool){
	var shipsToAdd = [new Ship("car"), new Ship("bat"), new Ship("cru"), new Ship("sub"), new Ship("des")];
	var myPlayer = bool ? 'player' : 'computer';

	for (var i = 0; i < shipsToAdd.length; i++) {
		var randCell,
			randDirection;

		/* Generate new Cell and direction, then check if legal. */
		do {
			randCell = new Cell(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), myPlayer);
			randDirection = (Math.random() < 0.5) ? 'Vert' : 'Horiz';
		} while (!board.isLegalShipPosition(randCell, randDirection, shipsToAdd[i]));

		updateBoard(randCell, randDirection, shipsToAdd[i], bool); // turn to false to hide

	}
}

/* Function to place a ship on the canvas. Takes parameters of Cell object,
 * string, and Ship object. 
 */
function placeShips(cell, direction, shipType) {
	var image = new Image(),
		x = (cell.player == 'player') ? cell.col * board.cellSize + board.startX1 + 1 : cell.col * board.cellSize + board.startX2 + 1,
		y = (cell.player == 'player') ? cell.row * board.cellSize + board.startY1 + 2 : cell.row * board.cellSize + board.startY2 + 2; 

	image.onload = function() {
		context.drawImage(image, x, y);
	};

	/* Sets image to constructed file location. */
	image.src = "Images/" + shipType.abbr + direction + "Img.png";
}

/* Function listens for a click event on the button with id="resetBoard".
 */
function randomBoardClickEvent(){
	$("randomBoard").onclick = function() {
		if (shipSum == 5) {
			populateBoard(true);
			carNum = 0;
			batNum = 0;
			cruNum = 0;
			subNum = 0;
			desNum = 0;
			shipSum = carNum + batNum + cruNum + subNum + desNum;
			updateHtmlShipCount();
			for (var i = 0; i < document.placeShip.shipType.length; i++){
				document.placeShip.shipType[i].disabled = true;
				document.placeShip.shipType[i].checked = false;
			}
			updateOutput("Game is ready! Click enemy grid to start.");
		}
	};
}

/*	Function populates the canvas element with images, grids, and grid
 *	labels that make up the game board.
 */
function makeBoard(){
		// Draw images first to be under grid.
		context.drawImage(img, board.startX1, board.startY1, board.imgSize, board.imgSize);
		context.drawImage(img, board.startX2, board.startY2, board.imgSize, board.imgSize);

		makeGrid(board.startX1, board.startY1, board.endX1, board.endY1);
		makeGrid(board.startX2, board.startY2, board.endX2, board.endY2);

		context.font = "bold 12px 'Airborne'";
		context.textAlign = "center";
		for (var col = 1, x = board.startX1 + 10, y = board.startY1 - 3; col <= 10; col++, x += (board.imgSize / 10)){
			context.fillText(col, x, y);
			context.fillText(col, x + board.imgSize + board.imgMargin, y);
		}

		var letters = "ABCDEFGHIJ";
		for (var row = 0, x = board.startX1 - 10, y = board.startY2 + 15; row <= letters.length; row++, y += (board.imgSize / 10)){
			context.fillText(letters.charAt(row), x, y);
			context.fillText(letters.charAt(row), x + board.imgSize + board.imgMargin, y);
		}

		context.beginPath();
		context.moveTo(225, 40);
		context.lineTo(228, canvas.height - 85);
		context.strokeStyle = 'black';
		context.stroke(); // draw lines

		context.font = "bold 16px 'Airborne'";
		context.fillText("Your Fleet", 115, 40);
		context.fillText("Enemy Fleet", 335, 40);

		/* Ship image titles */
		context.font = "bold 10px 'Arial'";
		context.fillStyle = 'rgb(0, 0, 0)';
		context.fillText("CARRIER", 125, 78);
		context.fillText("CARRIER", 125 + 220, 78);
		context.fillText("BATTLESHIP", 85, 107);
		context.fillText("BATTLESHIP", 85 + 220, 107);
		context.fillText("BATTLESHIP", 85 + 220, 107);
		context.fillText("CRUISER", 75, 139);
		context.fillText("CRUISER", 75 + 220, 139);	
		context.fillText("SUBMARINE", 170, 139);
		context.fillText("SUBMARINE", 170 + 220, 139);	
		context.fillText("DESTROYER", 180, 107);
		context.fillText("DESTROYER", 180 + 220, 107);	

		/* Green console at bottom. */
		context.beginPath();
		context.rect(board.startX1, canvas.height - 65, 400, 30);
		context.fillStyle = 'rgb(0, 76, 0)';
		context.fill();
		context.lineWidth = 2;
		context.strokeStyle = 'black';
		context.stroke();
}

/*	Function takes four integer parameters. 
 *		Grid starting coordinates: startX, startY
 *		Grid ending coordinates: endX, endY
 *	Lines are drawn using loops to spilt the image into a 10 x 10 grid.
 */
function makeGrid(startX, startY, endX, endY) {
		context.strokeStyle = "rgba(255, 255, 255, 0.6)"; // set line color
		//context.lineWidth = 2;

		/* 0.5 pixel shift used on all lines to force 1 pixel lines and remove line blur */
		/* Make vertical lines for grid*/
		for (var x = startX + 0.5; x <= endX + 0.5; x += ((endX - startX) / 10)) {
			context.beginPath();
			context.moveTo(x, startY);
			context.lineTo(x, endY);
			context.stroke(); // draw lines
		}

		/* Make horizontal lines for grid*/
		for (var y = startY + 0.5; y <= endY + 0.5; y += ((endY - startY) / 10)) {
			context.beginPath();
			context.moveTo(startX, y);
			context.lineTo(endX, y);
			context.stroke(); // draw lines
		}
}