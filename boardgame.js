Function.prototype.method = function(name, func) {
    this.prototype[name] = func;
    return this;
 };

Function.method('inherits', function(parent) {
    this.prototype.__proto__ = parent.prototype;
    return this;
});

function BoardGame() { };

BoardGame.prototype.initialize = function initialize(width, height, container, options) {
	this.width = width;
	this.height = height;
	this.container = container;

	this.cellWidth = options.cellWidth || 50;
	this.cellHeight = options.cellHeight || 50;
	this.lineWidth = options.lineWidth || 2;

	var canvas = document.createElement("canvas");
	canvas.width = this.width * this.cellWidth + this.lineWidth;
	canvas.height = this.height * this.cellHeight + this.lineWidth;
	this.addClickHandler(canvas);

	this.ctx = canvas.getContext("2d");
	this.canvas = canvas;

	container.appendChild(canvas);
};

BoardGame.prototype.addClickHandler = function addClickHandler(boardElement) {
	var me = this;

	boardElement.addEventListener("click", function(evt) {
		var cellX = Math.floor(evt.clientX / me.cellWidth);
		var cellY = Math.floor(evt.clientY / me.cellHeight);
		me.updateSelection(cellX, cellY);
	});
};

BoardGame.prototype.draw = function draw() {
	var canvasWidth = this.canvas.width;
	var canvasHeight = this.canvas.height;

	this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	this.ctx.strokeStyle = "black";
	this.ctx.lineWidth = this.lineWidth;

	this.ctx.beginPath();
	
	for (var x = 0; x <= this.width; ++x) {
		this.ctx.moveTo(x * this.cellWidth + 1, 0);
		this.ctx.lineTo(x * this.cellWidth + 1, canvasHeight);
	}

	for (var y = 0; y <= this.height; ++y) {
		this.ctx.moveTo(0, y * this.cellHeight + 1);
		this.ctx.lineTo(canvasWidth, y * this.cellHeight + 1);
	}
	
	this.ctx.closePath();
	this.ctx.stroke();
};

BoardGame.prototype.borderSquare = function borderSquare(x, y, color) {
	this.ctx.strokeStyle = color;
	this.ctx.strokeRect(x * this.cellWidth + 2, y * this.cellHeight + 2,
						this.cellWidth - 2, this.cellHeight - 2);
};

BoardGame.prototype.highlightSquare = function highlightSquare(x, y, color) {
	this.ctx.fillStyle = color;
	this.ctx.clearRect(x * this.cellWidth + 2, y * this.cellHeight + 2,
						this.cellWidth - 2, this.cellHeight - 2);
	this.ctx.globalAlpha = 0.3;
	this.ctx.fillRect(x * this.cellWidth + 2, y * this.cellHeight + 2,
						this.cellWidth - 2, this.cellHeight - 2);
	this.ctx.globalAlpha = 1.0;
};

BoardGame.prototype.updateSelection = function updateSelection(x, y) { };

// Pieces
const WHITE_KING = "\u2654";
const WHITE_QUEEN = "\u2655";
const WHITE_ROOK = "\u2656";
const WHITE_BISHOP = "\u2657";
const WHITE_KNIGHT = "\u2658";
const WHITE_PAWN = "\u2659";
const BLACK_KING = "\u265A";
const BLACK_QUEEN = "\u265B";
const BLACK_ROOK = "\u265C";
const BLACK_BISHOP = "\u265D";
const BLACK_KNIGHT = "\u265E";
const BLACK_PAWN = "\u265F";

const EMPTY = "";

function Move(chess, fromX, fromY, toX, toY) {
	this.chess = chess;
	this.fromX = fromX;
	this.fromY = fromY;
	this.toX = toX;
	this.toY = toY;
	this.destinationPiece = chess.squares[toY][toX];
};

Move.prototype.perform = function perform() {
	this.chess.squares[this.toY][this.toX] = this.chess.squares[this.fromY][this.fromX];
	this.chess.squares[this.fromY][this.fromX] = EMPTY;

	if (this.chess.squares[this.toY][this.toX] === BLACK_KING) {
		this.chess.kingPositionBlack.x = this.toX;
		this.chess.kingPositionBlack.y = this.toY;
	}

	if (this.chess.squares[this.toY][this.toX] === WHITE_KING) {
		this.chess.kingPositionWhite.x = this.toX;
		this.chess.kingPositionWhite.y = this.toY;
	}
};

Move.prototype.undo = function undo() {
	this.chess.squares[this.fromY][this.fromX] = this.chess.squares[this.toY][this.toX];
	this.chess.squares[this.toY][this.toX] = this.destinationPiece;

	if (this.chess.squares[this.fromY][this.fromX] === BLACK_KING) {
		this.chess.kingPositionBlack.x = this.fromX;
		this.chess.kingPositionBlack.y = this.fromY;
	}

	if (this.chess.squares[this.fromY][this.fromX] === WHITE_KING) {
		this.chess.kingPositionWhite.x = this.fromX;
		this.chess.kingPositionWhite.y = this.fromY;
	}
};

Move.prototype.toString = function toString() {
	return "(" + this.fromX + ", " + this.fromY + ") -> (" + this.toX + ", " + this.toY + ")";
};

function Chess() {
	this.squares = [
		[BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING, BLACK_BISHOP, BLACK_KNIGHT, BLACK_ROOK],
		[BLACK_PAWN, BLACK_PAWN,   BLACK_PAWN,   BLACK_PAWN,  BLACK_PAWN, BLACK_PAWN,   BLACK_PAWN,   BLACK_PAWN],
		[EMPTY,      EMPTY,        EMPTY,        EMPTY,       EMPTY,      EMPTY,        EMPTY,        EMPTY],
		[EMPTY,      EMPTY,        EMPTY,        EMPTY,       EMPTY,      EMPTY,        EMPTY,        EMPTY],
		[EMPTY,      EMPTY,        EMPTY,        EMPTY,       EMPTY,      EMPTY,        EMPTY,        EMPTY],
		[EMPTY,      EMPTY,        EMPTY,        EMPTY,       EMPTY,      EMPTY,        EMPTY,        EMPTY],
		[WHITE_PAWN, WHITE_PAWN,   WHITE_PAWN,   WHITE_PAWN,  WHITE_PAWN, WHITE_PAWN,   WHITE_PAWN,   WHITE_PAWN],
		[WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING, WHITE_BISHOP, WHITE_KNIGHT, WHITE_ROOK]
	];

	this.possibleMoves = [];
	this.possibleCaptures = [];

	this.colorToMove = "White";

	this.kingPositionWhite = {
		x: 4,
		y: 7
	};

	this.kingPositionBlack = {
		x: 4,
		y: 0
	};

	this.moves = [];
};

Chess.inherits(BoardGame);

Chess.prototype.createGame = function createGame() {
	var container = document.getElementById("board-container");
	this.initialize(8, 8, container, {});
	this.turnIndicator = document.createElement("div");
	var span = document.createElement("span");
	this.turnIndicator.appendChild(span);
	this.turnIndicator.style.position = "absolute";
	this.turnIndicator.style.left = (this.canvas.width + 12) + "px";
	this.turnIndicator.style.top = (this.canvas.height * 0.5) + "px";
	this.turnIndicator.style.pointerEvents = "none";
	container.appendChild(this.turnIndicator);
	this.turnIndicator.setValue = function setValue(colorToMove) {
		span.innerHTML = colorToMove + " to move.";
	};
	this.turnIndicator.setValue(this.colorToMove);
};

Chess.prototype.updateSelection = function updateSelection(x, y) {
	if (this.selectedTile) {
		var move = null;

		for (var idx = 0, len = this.possibleMoves.length; idx < len; ++idx) {
			var position = this.possibleMoves[idx];
			if (x === position.x && y === position.y) {
				move = new Move(this, this.selectedTile.x, this.selectedTile.y, position.x, position.y);
				break;
			}
		}

		for (var idx = 0, len = this.possibleCaptures.length; idx < len; ++idx) {
			var position = this.possibleCaptures[idx];
			if (x === position.x && y === position.y) {
				move = new Move(this, this.selectedTile.x, this.selectedTile.y, position.x, position.y);
				break;
			}
		}

		if (move) {
			move.perform();

			// If this move results in check for the color moving, then it's illegal
			if (this.isCheck(this.colorToMove)) {
				console.log("Invalid move - results in check.");
				// Undo the move and we don't pass the turn
				move.undo();
				move = null;
			} else {
				this.moves.push(move);
			}
		}

		this.draw();

		if (move) {
			this.selectedTile = null;
			this.possibleMoves = [];
			this.possibleCaptures = [];
			this.passTurn();
			return;
		}
	}

	if (this.squares[y][x] === EMPTY) {
		return;
	}

	if (! this["is" + this.colorToMove](x, y)) {
		return;
	}

	this.borderSquare(x, y, "red");
	this.selectedTile = {
		x: x,
		y: y
	};

	var potentialMoves = this.getMoves(this.squares[y][x], x, y);
	this.possibleMoves = [];

	for (var idx = 0, len = potentialMoves.length; idx < len; ++idx) {
		var move = new Move(this, x, y, potentialMoves[idx].x, potentialMoves[idx].y);
		move.perform();

		if (! this.isCheck(this.colorToMove)) {
			this.possibleMoves.push(potentialMoves[idx]);
		} else {
			console.log("Move " + move + " is check.");
		}

		move.undo();
	}

	var potentialCaptures = this.getCaptures(this.squares[y][x], x, y);
	this.possibleCaptures = [];
	for (var idx = 0, len = potentialCaptures.length; idx < len; ++idx) {
		var move = new Move(this, x, y, potentialCaptures[idx].x, potentialCaptures[idx].y);
		move.perform();

		if (! this.isCheck(this.colorToMove)) {
			this.possibleCaptures.push(potentialCaptures[idx]);
		} else {
			console.log("Move " + move + " is check.");
		}

		move.undo();
	}

	this.drawMoves(this.possibleMoves);
	this.drawCaptures(this.possibleCaptures);
};

Chess.prototype.passTurn = function passTurn() {
	this.colorToMove = (this.colorToMove === "White" ? "Black" : "White");
	this.turnIndicator.setValue(this.colorToMove);

	for (var y = 0; y < this.squares.length; ++y) {
		var row = this.squares[y];
		for (var x = 0; x < row.length; ++x) {
			if (this.isEmpty(x, y)) {
				continue;
			}

			if (! this["is" + this.colorToMove](x, y)) {
				continue;
			}

			var potentialMoves = this.getMoves(this.squares[y][x], x, y);

			for (var idx = 0, len = potentialMoves.length; idx < len; ++idx) {
				var move = new Move(this, x, y, potentialMoves[idx].x, potentialMoves[idx].y);
				move.perform();

				if (! this.isCheck(this.colorToMove)) {
					move.undo();
					return;
				}

				move.undo();
			}

			var potentialCaptures = this.getCaptures(this.squares[y][x], x, y);
			for (var idx = 0, len = potentialCaptures.length; idx < len; ++idx) {
				var move = new Move(this, x, y, potentialCaptures[idx].x, potentialCaptures[idx].y);
				move.perform();

				if (! this.isCheck(this.colorToMove)) {
					move.undo();
					return;
				}

				move.undo();
			}
		}
	}

	alert("Checkmate.  " + (this.colorToMove === "White" ? "Black" : "White") + " has won.");
};

Chess.prototype.getMoves = function getMoves(type, x, y, skipChecks) {
	var moves;
	switch (type) {
		case WHITE_PAWN:
			moves = this.getWhitePawnMoves(x, y);
			break;
		case BLACK_PAWN:
			moves = this.getBlackPawnMoves(x, y);
			break;
		case WHITE_KNIGHT:
		case BLACK_KNIGHT:
			moves = this.getKnightMoves(x, y);
			break;
		case WHITE_BISHOP:
		case BLACK_BISHOP:
			return this.getBishopMoves(x, y);
		case WHITE_ROOK:
		case BLACK_ROOK:
			moves = this.getRookMoves(x, y);
			break;
		case WHITE_QUEEN:
		case BLACK_QUEEN:
			moves = this.getQueenMoves(x, y);
			break;
		case WHITE_KING:
			moves = this.getWhiteKingMoves(x, y, skipChecks);
			break;
		case BLACK_KING:
			moves = this.getBlackKingMoves(x, y, skipChecks);
			break;
	}

	return moves;
};

Chess.prototype.getCaptures = function getCaptures(type, x, y) {
	var captures;
	switch (type) {
		case WHITE_PAWN:
			captures = this.getWhitePawnCaptures(x, y);
			break;
		case BLACK_PAWN:
			captures = this.getBlackPawnCaptures(x, y);
			break;
		case WHITE_KNIGHT:
			captures = this.getWhiteKnightCaptures(x, y);
			break;
		case BLACK_KNIGHT:
			captures = this.getBlackKnightCaptures(x, y);
			break;
		case WHITE_BISHOP:
			captures = this.getWhiteBishopCaptures(x, y);
			break;
		case BLACK_BISHOP:
			captures = this.getBlackBishopCaptures(x, y);
			break;
		case WHITE_ROOK:
			captures = this.getWhiteRookCaptures(x, y);
			break;
		case BLACK_ROOK:
			captures = this.getBlackRookCaptures(x, y);
			break;
		case WHITE_QUEEN:
			captures = this.getWhiteQueenCaptures(x, y);
			break;
		case BLACK_QUEEN:
			captures = this.getBlackQueenCaptures(x, y);
			break;
		case WHITE_KING:
			captures = this.getWhiteKingCaptures(x, y);
			break;
		case BLACK_KING:
			captures = this.getBlackKingCaptures(x, y);
			break;
	}

	return captures;
};

Chess.prototype.isEmpty = function isEmpty(x, y) {
	return (y >= 0 && y < this.squares.length &&
			x >= 0 && x < this.squares[y].length &&
			EMPTY === this.squares[y][x]);
};

Chess.prototype.isCapture = function isCapture(x, y) {
	return (y >= 0 && y < this.squares.length &&
			x >= 0 && x < this.squares[y].length &&
			EMPTY !== this.squares[y][x]);
};

Chess.prototype.isWhite = function isWhite(x, y) {
	if (this.isEmpty(x, y)) {
		return false;
	}

	var piece = this.squares[y][x];
	return (piece === WHITE_PAWN   ||
			piece === WHITE_ROOK   ||
			piece === WHITE_KNIGHT ||
			piece === WHITE_BISHOP ||
			piece === WHITE_QUEEN  ||
			piece === WHITE_KING);
};

Chess.prototype.isBlack = function isBlack(x, y) {
	if (this.isEmpty(x, y)) {
		return false;
	}

	var piece = this.squares[y][x];
	return (piece === BLACK_PAWN   ||
			piece === BLACK_ROOK   ||
			piece === BLACK_KNIGHT ||
			piece === BLACK_BISHOP ||
			piece === BLACK_QUEEN  ||
			piece === BLACK_KING);
};

Chess.prototype.isWhiteCapture = function isWhiteCapture(x, y) {
	return this.isCapture(x, y) && this.isBlack(x, y);
};

Chess.prototype.isBlackCapture = function isBlackCapture(x, y) {
	return this.isCapture(x, y) && this.isWhite(x, y);
};

Chess.prototype.getWhitePawnMoves = function getWhitePawnMoves(x, y) {
	var moves = [];
	if (this.isEmpty(x, y - 1)) {
		moves.push({ x: x, y: y - 1 });
	}
	if (y === 6 && this.isEmpty(x, y - 2)) {
		moves.push({ x: x, y: y - 2 });
	}

	return moves;
};

Chess.prototype.getWhitePawnCaptures = function getWhitePawnCaptures(x, y) {
	var captures = [];

	if (this.isWhiteCapture(x + 1, y - 1)) {
		captures.push({ x: x + 1, y: y - 1 });
	}

	if (this.isWhiteCapture(x - 1, y - 1)) {
		captures.push({ x: x - 1, y: y - 1 });
	}

	return captures;
};

Chess.prototype.getBlackPawnMoves = function getBlackPawnMoves(x, y) {
	var moves = [];
	if (this.isEmpty(x, y + 1)) {
		moves.push({ x: x, y: y + 1});
	}
	if (y === 1 && this.isEmpty(x, y + 2)) {
		moves.push({ x: x, y: y + 2});
	}

	return moves;
};

Chess.prototype.getBlackPawnCaptures = function getBlackPawnCaptures(x, y) {
	var captures = [];

	if (this.isBlackCapture(x + 1, y + 1)) {
		captures.push({ x: x + 1, y: y + 1 });
	}

	if (this.isBlackCapture(x - 1, y + 1)) {
		captures.push({ x: x - 1, y: y + 1 });
	}

	return captures;
};

Chess.prototype.getKnightMoves = function getKnightMoves(x, y) {
	var moves = [
		{ x: x + 2, y: y + 1 },
		{ x: x + 2, y: y - 1 },
		{ x: x + 1, y: y + 2 },
		{ x: x + 1, y: y - 2 },
		{ x: x - 1, y: y + 2 },
		{ x: x - 1, y: y - 2 },
		{ x: x - 2, y: y + 1 },
		{ x: x - 2, y: y - 1 }
	];

	for (var idx = moves.length - 1; idx >= 0; --idx) {
		if (this.isEmpty(moves[idx].x, moves[idx].y)) {
			continue;
		}

		moves.splice(idx, 1);
	}

	return moves;
};

Chess.prototype.getWhiteKnightCaptures = function getWhiteKnightCaptures(x, y) {
	var captures = [
		{ x: x + 2, y: y + 1 },
		{ x: x + 2, y: y - 1 },
		{ x: x + 1, y: y + 2 },
		{ x: x + 1, y: y - 2 },
		{ x: x - 1, y: y + 2 },
		{ x: x - 1, y: y - 2 },
		{ x: x - 2, y: y + 1 },
		{ x: x - 2, y: y - 1 }
	];

	for (var idx = captures.length - 1; idx >= 0; --idx) {
		if (this.isWhiteCapture(captures[idx].x, captures[idx].y)) {
			continue;
		}

		captures.splice(idx, 1);
	}

	return captures;
};

Chess.prototype.getBlackKnightCaptures = function getWhiteKnightCaptures(x, y) {
	var captures = [
		{ x: x + 2, y: y + 1 },
		{ x: x + 2, y: y - 1 },
		{ x: x + 1, y: y + 2 },
		{ x: x + 1, y: y - 2 },
		{ x: x - 1, y: y + 2 },
		{ x: x - 1, y: y - 2 },
		{ x: x - 2, y: y + 1 },
		{ x: x - 2, y: y - 1 }
	];

	for (var idx = captures.length - 1; idx >= 0; --idx) {
		if (this.isBlackCapture(captures[idx].x, captures[idx].y)) {
			continue;
		}

		captures.splice(idx, 1);
	}

	return captures;
};

Chess.prototype.getBishopMoves = function getBishopMoves(x, y) {
	var moves = [];

	var deltas = [
		{ x:  1, y:  1 },
		{ x:  1, y: -1 },
		{ x: -1, y:  1 },
		{ x: -1, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			moves.push({ x: testX, y: testY });
			testX += delta.x;
			testY += delta.y;
		}
	}

	return moves;
};

Chess.prototype.getWhiteBishopCaptures = function getWhiteBishopCaptures(x, y) {
	var captures = [];

	var deltas = [
		{ x:  1, y:  1 },
		{ x:  1, y: -1 },
		{ x: -1, y:  1 },
		{ x: -1, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			testX += delta.x;
			testY += delta.y;
		}
		if (this.isWhiteCapture(testX, testY)) {
			captures.push({ x: testX, y: testY });
		}
	}

	return captures;
};

Chess.prototype.getBlackBishopCaptures = function getBlackBishopCaptures(x, y) {
	var captures = [];

	var deltas = [
		{ x:  1, y:  1 },
		{ x:  1, y: -1 },
		{ x: -1, y:  1 },
		{ x: -1, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			testX += delta.x;
			testY += delta.y;
		}
		if (this.isBlackCapture(testX, testY)) {
			captures.push({ x: testX, y: testY });
		}
	}

	return captures;
};

Chess.prototype.getRookMoves = function getRookMoves(x, y) {
	var moves = [];

	var deltas = [
		{ x:  1, y:  0 },
		{ x: -1, y:  0 },
		{ x:  0, y:  1 },
		{ x:  0, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			moves.push({ x: testX, y: testY });
			testX += delta.x;
			testY += delta.y;
		}
	}

	return moves;
};

Chess.prototype.getWhiteRookCaptures = function getWhiteRookCaptures(x, y) {
	var captures = [];

	var deltas = [
		{ x:  1, y:  0 },
		{ x: -1, y:  0 },
		{ x:  0, y:  1 },
		{ x:  0, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			testX += delta.x;
			testY += delta.y;
		}
		if (this.isWhiteCapture(testX, testY)) {
			captures.push({ x: testX, y: testY });
		}
	}

	return captures;
};

Chess.prototype.getBlackRookCaptures = function getBlackRookCaptures(x, y) {
	var captures = [];

	var deltas = [
		{ x:  1, y:  0 },
		{ x: -1, y:  0 },
		{ x:  0, y:  1 },
		{ x:  0, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			testX += delta.x;
			testY += delta.y;
		}
		if (this.isBlackCapture(testX, testY)) {
			captures.push({ x: testX, y: testY });
		}
	}

	return captures;
};

Chess.prototype.getQueenMoves = function getQueenMoves(x, y) {
	var moves = [];

	var deltas = [
		{ x:  1, y:  0 },
		{ x: -1, y:  0 },
		{ x:  0, y:  1 },
		{ x:  0, y: -1 },
		{ x:  1, y:  1 },
		{ x:  1, y: -1 },
		{ x: -1, y:  1 },
		{ x: -1, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			moves.push({ x: testX, y: testY });
			testX += delta.x;
			testY += delta.y;
		}
	}

	return moves;
};

Chess.prototype.getWhiteQueenCaptures = function getWhiteQueenCaptures(x, y) {
	var captures = [];

	var deltas = [
		{ x:  1, y:  0 },
		{ x: -1, y:  0 },
		{ x:  0, y:  1 },
		{ x:  0, y: -1 },
		{ x:  1, y:  1 },
		{ x:  1, y: -1 },
		{ x: -1, y:  1 },
		{ x: -1, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			testX += delta.x;
			testY += delta.y;
		}
		if (this.isWhiteCapture(testX, testY)) {
			captures.push({ x: testX, y: testY });
		}
	}

	return captures;
};

Chess.prototype.getBlackQueenCaptures = function getBlackQueenCaptures(x, y) {
	var captures = [];

	var deltas = [
		{ x:  1, y:  0 },
		{ x: -1, y:  0 },
		{ x:  0, y:  1 },
		{ x:  0, y: -1 },
		{ x:  1, y:  1 },
		{ x:  1, y: -1 },
		{ x: -1, y:  1 },
		{ x: -1, y: -1 }
	];

	for (var idx = 0, len = deltas.length; idx < len; ++idx) {
		var delta = deltas[idx];
		var testX = x + delta.x, testY = y + delta.y;
		while (this.isEmpty(testX, testY)) {
			testX += delta.x;
			testY += delta.y;
		}
		if (this.isBlackCapture(testX, testY)) {
			captures.push({ x: testX, y: testY });
		}
	}

	return captures;
};

Chess.prototype.isCheck = function isCheck(color) {
	return this.isThreatened(this["kingPosition" + color].x, this["kingPosition" + color].y, color);
};

Chess.prototype.isThreatened = function isThreatened(_x, _y, color) {
	for (var y = 0; y < this.squares.length; ++y) {
		var row = this.squares[y];
		for (var x = 0; x < row.length; ++x) {
			if (this.isEmpty(x, y)) {
				continue;
			}

			if (this["is" + color](x, y)) {
				continue;
			}

			var piece = row[x];
			var toCheck = [];
			if (piece === (color === "White" ? BLACK_PAWN : WHITE_PAWN)) {
				toCheck = [
					{ x: x + 1, y: y + 1 },
					{ x: x - 1, y: y + 1 }
				];
			} else {
				toCheck = this.getMoves(piece, x, y, true);
				var captures = this.getCaptures(piece, x, y);
				for (var idx = 0, len = captures.length; idx < len; ++idx) {
					toCheck.push(captures[idx]);
				}
			}

			for (var idx = 0, len = toCheck.length; idx < len; ++idx) {
				if (_x === toCheck[idx].x && _y === toCheck[idx].y) {
					return true;
				}
			}
		}
	}

	return false;
};

Chess.prototype.getWhiteKingMoves = function getWhiteKingMoves(x, y) {
	var moves = [];
	for (var dy = -1; dy <= 1; ++dy) {
		for (var dx = -1; dx <= 1; ++dx) {
			if (dx === 0 && dy === 0) {
				continue;
			}

			if (! this.isEmpty(x + dx, y + dy)) {
				continue;
			}

			moves.push({ x: x + dx, y: y + dy });
		}
	}

	return moves;
};

Chess.prototype.getWhiteKingCaptures = function getWhiteKingCaptures(x, y) {
	var captures = [];
	for (var dy = -1; dy <= 1; ++dy) {
		for (var dx = -1; dx <= 1; ++dx) {
			if (dx === 0 && dy === 0) {
				continue;
			}

			if (! this.isWhiteCapture(x + dx, y + dy)) {
				continue;
			}

			captures.push({ x: x + dx, y: y + dy });
		}
	}

	return captures;
};

Chess.prototype.getBlackKingMoves = function getBlackKingMoves(x, y, skipChecks) {
	var moves = [];
	for (var dy = -1; dy <= 1; ++dy) {
		for (var dx = -1; dx <= 1; ++dx) {
			if (dx === 0 && dy === 0) {
				continue;
			}

			if (! this.isEmpty(x + dx, y + dy)) {
				continue;
			}

			moves.push({ x: x + dx, y: y + dy });
		}
	}

	return moves;
};

Chess.prototype.getBlackKingCaptures = function getBlackKingCaptures(x, y) {
	var captures = [];
	for (var dy = -1; dy <= 1; ++dy) {
		for (var dx = -1; dx <= 1; ++dx) {
			if (dx === 0 && dy === 0) {
				continue;
			}

			if (! this.isBlackCapture(x + dx, y + dy)) {
				continue;
			}

			captures.push({ x: x + dx, y: y + dy });
		}
	}

	return captures;
};

Chess.prototype.drawMoves = function drawMoves(moves) {
	for (var idx = 0, len = moves.length; idx < len; ++idx) {
		this.highlightSquare(moves[idx].x, moves[idx].y, "green");
	}
};

Chess.prototype.drawCaptures = function drawCaptures(captures) {
	for (var idx = 0, len = captures.length; idx < len; ++idx) {
		this.highlightSquare(captures[idx].x, captures[idx].y, "orange");
		this.drawSquare(captures[idx].x, captures[idx].y);
	}
};

Chess.prototype.drawSquare = function drawSquare(x, y) {
	if (y < 0 ||
		y >= this.squares.length ||
		x < 0 ||
		x >= this.squares[y].length ||
		this.squares[y][x] === EMPTY) return;

	this.ctx.font = "40px calibri";
	this.ctx.textAlign = "center";
	this.ctx.fillStyle = "black";

	var piece = this.squares[y][x];
	this.ctx.fillText(piece, (x + 0.5) * this.cellWidth, (y + 0.5) * this.cellHeight + 0.5 * 35);
};

Chess.prototype.draw = function draw() {
	BoardGame.prototype.draw.apply(this);

	// Draw the fills
	this.ctx.fillStyle = "blue";
	this.ctx.globalAlpha = 0.4;
	for (var y = 0; y < this.height; ++y) {
		var start = 2;
		if ((y % 2) === 0) {
			start += this.cellWidth;
		}

		for (var x = 0; x < this.width * 0.5; ++x) {
			this.ctx.fillRect(
				start + x * 2 * this.cellWidth, y * this.cellHeight,
				this.cellWidth, this.cellHeight
			);
		}
	}
	this.ctx.globalAlpha = 1.0;

	// Now we need to draw all our pieces
	this.ctx.font = "40px calibri";
	this.ctx.textAlign = "center";
	this.ctx.fillStyle = "black";

	for (var yIdx = 0, yMax = this.squares.length; yIdx < yMax; ++yIdx) {
		var row = this.squares[yIdx];
		for (var xIdx = 0, xMax = row.length; xIdx < xMax; ++xIdx) {
			var piece = row[xIdx];
			if (! piece) continue;

			this.ctx.fillText(piece, (xIdx + 0.5) * this.cellWidth, (yIdx + 0.5) * this.cellHeight + 0.5 * 35);
		}
	}
};

window.addEventListener("load", function() {
	var c = new Chess();
	c.createGame();
	c.draw();
});