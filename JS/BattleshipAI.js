function AI() {
	"use strict";
	var lastCellHit = [],
		currentTarget = [],
		
		// moves for each ship type, each with an array of Cell objects.
		targetModeMoves = { 'car': [], 'bat': [], 'cru': [], 'sub': [], 'des': [] }; 

	/* Function can be used to check if an array contains an object
	 * that has a hashCode method that returns an integer hash value.
	 * Takes parameters array and object.
	 * Returns true if a match is found, false if not.
	 */
	function contains(array, object) {
		var retVal = false;
		var size = array.length - 1;
		/* Traverse array backwards. */
		for (var i = size; i >= 0; i--) {
			var element = array[i],
				hash1 = object.hashCode(),
				hash2 = element.hashCode();
			/* Check object equality by comparing hash values. */
			if (hash1 == hash2) {
				retVal = true;
				break; // match found, so stop looking
			}
		}
		
		return retVal;
	}

	/* Function is used to determine if the current target is sunk
	 * and removes that ship from the target list and its moves.
	 */
	function confirmTarget() {
		if (currentTarget.length > 0 && currentTarget[0].sunk()) {
			targetModeMoves[currentTarget[0].abbr].length = 0; // clear remaining moves for the ship
			currentTarget.shift(); // remove first element in currentTarget array
			lastCellHit.shift();
		}
	}

	/* Function is used to when a ship is hit to determine the possible
	 * adjacent locations that the ship may be in and adds any moves to 
	 * targetModeMoves. Takes Cell object and string representing the hit
	 * ship's abbr.
	 */
	function addTargets(cell, ship) {
		var direction;
		var logic1 = lastCellHit.length > 0, // check length before looking for index
			logic2 = findShip(cell).hashCode() == findShip(lastCellHit[0]).hashCode(), // check if same ship as current target
			logic3 = cell.hashCode() != lastCellHit[0].hashCode(); // make sure not the same cell as target
		
		/* Check if lastCellHit is empty and if lastCellHit and passed cell as the same. */
		if( logic1 && logic2 && logic3){
			/* If rows match, then ship is horizontal. */
			if (cell.row === lastCellHit[0].row) {
				direction = 'horiz';
				
				/* Remove any vertical targets from targetModeMoves for current ship. */
				for (var i = 0; i < targetModeMoves[ship].length; i++) {
					if( targetModeMoves[ship][i].row != cell.row) {
						targetModeMoves[ship].splice(i, 1);
					}
				}
				
			/* If columns match, then ship is vertical. */
			} else if (cell.col === lastCellHit[0].col) {
				direction = 'vert';
				
				/* Remove any horizontal targets from targetModeMoves for current ship. */
				for (var i = 0; i < targetModeMoves[ship].length; i++) {
					if( targetModeMoves[ship][i].col != cell.col) {
						targetModeMoves[ship].splice(i, 1);
					}
				}
			}
		}
			
		var circle = [];
		var cellV1 = new Cell(cell.row - 1, cell.col, cell.player),
			cellV2 = new Cell(cell.row + 1, cell.col, cell.player),
			cellH1 = new Cell(cell.row, cell.col - 1, cell.player),
			cellH2 = new Cell(cell.row, cell.col + 1, cell.player);
		
		if (direction == 'horiz') {
			circle.push(cellH1, cellH2);
		} else if (direction == 'vert') {
			circle.push(cellV1, cellV2);
		} else {
			circle.push(cellV1, cellV2, cellH1, cellH2);
		}
		
		/* From cells in circle, choose random index to add to targetModeModes. */
		var size = circle.length;
		for (var i = 0; i < size; i++) {
			var randomIndex = Math.floor(Math.random() * circle.length),
				randCell = circle[randomIndex];
			if (board.isCellAttackable(randCell)) {
				targetModeMoves[ship].push(randCell);
			}
			circle.splice(randomIndex, 1);
		}
	}

	/* Function controls a mode where the AI will randomly hunt for ships.
	 * Only coordinates in a checker board pattern are chosen to 
	 * lowered the number of moves required to hit all ships.
	 */
	function huntMode() {
		var row = Math.floor(Math.random() * 10),
			col = Math.floor(Math.random() * 10),
			randCell = new Cell(row, col, 'player'),
			myBoard = board.getBoard('player');
		
		/* Check if sum of cell coordinates is even (ie. fills a checker board pattern)
		 * Since smallest ship is two cells long, a checker board pattern will reduce 
		 * the potential number of cells to find all ships by around 45% (50 vs 88).
		 */ 
		while ( (row + col) % 2 !== 0 || !board.isCellAttackable(randCell)) {
			row = Math.floor(Math.random() * 10);
			col = Math.floor(Math.random() * 10);
			randCell = new Cell(row, col, 'player');
		}
		
		/* Record Cell if attackCell hits a ship. */
		if (attackCell(randCell)) {
			var type = myBoard[randCell.row][randCell.col].ship;
			currentTarget.push(type);
			lastCellHit.push(randCell);
			addTargets(randCell, currentTarget[0].abbr);
		}
	}

	/* Function controls a mode where the AI will search for the rest
	 * of a ship after huntMode has hit a ship.
	 */
	function targetMode(){
		var shipFound,
			cell = targetModeMoves[currentTarget[0].abbr].pop(),
			myBoard = board.getBoard('player');
			
		if (attackCell(cell)) {
			shipFound = myBoard[cell.row][cell.col].ship;
			
			/* Check if the ship hit is the same as the one targeted. */
			if (shipFound == currentTarget[0]) {
				addTargets(cell, currentTarget[0].abbr);
			} else {
				/* If ship hit is not target, search target queue. */
				for (var i = 0; i <= currentTarget.length - 1; i++) {
					if (shipFound.hashCode() == currentTarget[i].hashCode()) {
						addTargets(cell, currentTarget[i].abbr);
						break;
					}
					
					/* Ship not in list if at last element and past first check. */
					if (i == currentTarget.length - 1) {
						lastCellHit.push(cell);
						currentTarget.push(shipFound);
						addTargets(cell, shipFound.abbr);
					}
				}
			}
		}
	}

	/* Function controls computer move AI. */
	this.move = function() {
		confirmTarget(); // check if current target is sunk
		if (currentTarget.length > 0 && targetModeMoves[currentTarget[0].abbr].length > 0) {
			targetMode(); // only run if there is a current target and moves to attack it. 
		} else {
			huntMode();
		}
	};
}