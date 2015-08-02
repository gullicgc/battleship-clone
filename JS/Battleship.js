/* Variables related to imported images and canvas. */
var canvas,
	context,
	img = new Image();

/* Games state variables. */
var currentPlayer = 'player',
	gameInProgress = false,
	gameWon = false;
	
/* Function to make access to DOM elements by id easier. */	
function $(id) {
	return document.getElementById(id);
}

/* Function changes the state of currentPlayer global variable to the player
 * that is next.
 */
function switchPlayers(){
	currentPlayer = (currentPlayer == 'player') ? 'computer' : 'player';
}

/* Function to pass text to the green output console on the canvas. 
 * Console needs to be redrawn before new text to wipe the old text.
 */
function updateOutput(text) {
	/* Redraw console. */
	context.beginPath();
	context.rect(board.startX1, canvas.height - 65, 400, 30);
	context.fillStyle = 'rgb(0, 76, 0)';
	context.fill();
	context.lineWidth = 2;
	context.strokeStyle = 'black';
	context.stroke();
	
	/* Text to display. */
	context.font = "bold 14px 'Airborne'";
	context.fillStyle = 'rgb(0, 163, 0)';
	context.textAlign = 'left';
	context.fillText(text, board.startX1 + 5, 380);
}

/* Function is used to update canvas when a shot is fired.
 * Created a small radial gradient of white for miss and red
 * for hit. Takes parameters number, number, number, rgb string.
 */
function displayAttack(x, y, radius, color) {
    context.beginPath();
    var rad = context.createRadialGradient(x, y, 1, x, y, radius);
    rad.addColorStop(0, 'rgba(' + color + ',1)');
    rad.addColorStop(1, 'rgba(' + color + ',0)');
    context.fillStyle = rad;
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.fill();
}

/* Function checks for a player win and stops game if win found. */
function checkForVictory(){
	var winner;
	if (gameInProgress) {
		if (compShips === 0) {
			winner = 'Player';
		} 
		if (playerShips === 0) {
			winner = 'Computer';
		}
		
		if(winner) {
			updateOutput(winner + " wins!");
			context.font = "bold 24px 'Airborne'";
			context.fillStyle = 'blue';
			context.textAlign = 'center';
			context.fillText(winner + " wins!", 225, 20);
			gameInProgress = false;
			gameWon = true;
			currentPlayer = 'player';
		}	
	}
}

/* Function resets the game by reloading the page. */
function resetGame() {
	/* Force page refresh */
	window.location.reload(true);
}

/* Function listens for a click event on the button with id="resetBoard".
 */
function resetBoardClickEvent() {
	$("resetBoard").onclick = function() {
		resetGame();
	};
}

/* Function draws all images on the canvas. */
function draw() {
	var imgScrew = new Image(),
		imgCarrier = new Image(),
		imgBattleship = new Image(),
		imgCruiser = new Image(),
		imgSubmarine = new Image(),
		imgDestroyer = new Image();

	imgScrew.onload = function() {
		context.drawImage(imgScrew, 5, 5, 20, 20);
		context.drawImage(imgScrew, 5, canvas.height - 25, 20, 20);
		context.drawImage(imgScrew, canvas.width - 25, 5, 20, 20);
		context.drawImage(imgScrew, canvas.width - 25, canvas.height - 25, 20, 20);
	};

	img.onload = function() {
		context.fillStyle = 'black';
		makeBoard();
	};

	imgCarrier.onload = function() {
		var x1 = 30 + board.startX1, x2 = 30 + board.startX2, y1 = board.startY1 - 115 , 
			y2 = y1, scale1 = imgCarrier.width / 2, scale2 = imgCarrier.height / 2;
		context.drawImage(imgCarrier, x1, y1, scale1, scale2);
		context.drawImage(imgCarrier, x2, y2, scale1, scale2);
	};

	imgBattleship.onload = function() {
		var x1 = board.startX1, x2 = board.startX2, y1 = board.startY1 - 106 + imgCarrier.height / 2, 
			y2 = y1, scale1 = imgBattleship.width / 2, scale2 = imgBattleship.height / 2;
		context.drawImage(imgBattleship, x1, y1, scale1, scale2);
		context.drawImage(imgBattleship, x2, y2, scale1, scale2);		
	};

	imgCruiser.onload = function() {
		var x1 = board.startX1, x2 = board.startX2, y1 = board.startY1 - 95 + imgCarrier.height / 2 + imgBattleship.height / 2, 
			y2 = y1, scale1 = imgCruiser.width / 2, scale2 = imgCruiser.height / 2;
		context.drawImage(imgCruiser, x1, y1, scale1, scale2);
		context.drawImage(imgCruiser, x2, y2, scale1, scale2);
	};

	imgSubmarine.onload = function() {
		var x1 = board.startX1 + imgSubmarine.width / 2 + 18, x2 = board.startX2 + imgSubmarine.width / 2 + 18, 
			y1 = board.startY1 - 95 + imgCarrier.height / 2 + imgBattleship.height / 2, 
			y2 = y1, scale1 = imgSubmarine.width / 2, scale2 = imgSubmarine.height / 2;
		context.drawImage(imgSubmarine, x1, y1, scale1, scale2);
		context.drawImage(imgSubmarine, x2, y2, scale1, scale2);
	};

	imgDestroyer.onload = function() {
		var x1 = board.startX1 + imgBattleship.width / 2 + 20, x2 = board.startX2 + imgBattleship.width / 2 + 20, 
			y1 = board.startY1 - 105 + imgCarrier.height / 2, 
			y2 = y1, scale1 = imgDestroyer.width / 2, scale2 = imgDestroyer.height / 2;
		context.drawImage(imgDestroyer, x1, y1, scale1, scale2);
		context.drawImage(imgDestroyer, x2, y2, scale1, scale2);
	};

	img.src = "Images/ocean.png";
	imgScrew.src = "Images/phillips.png";
	imgCarrier.src = "Images/carrierProfile.png";
	imgBattleship.src = "Images/battleshipProfile.png";
	imgCruiser.src = "Images/cruiserProfile.png";
	imgSubmarine.src = "Images/submarineProfile.png";
	imgDestroyer.src = "Images/destroyerProfile.png";
}

/* Run when webpage loads. */
window.onload = function() {
	resetBoardClickEvent();
	randomBoardClickEvent();
	canvas = $('canvas');
	canvas.addEventListener("click", boardOnClick, false);
	context = canvas.getContext('2d');
	updateHtmlShipCount();
	draw();
	populateBoard(false);
};