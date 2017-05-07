"use strict";

var UtilsModule = typeof module !== 'undefined' ? require('./Utils.js') : Utils;

class LocalSolver {
	getRandomMoves(emptyTilePosition, moves)
	{
		var result = [];
		var visited = [];
		var lastMove = emptyTilePosition;
		for(var i = 0; i < moves; i++){
			const allowedMoves = UtilsModule.getAdjacents(lastMove, 4)
				.filter(m=>visited.indexOf(m)<0);
			
			if (allowedMoves.length == 0)
			{
				visited = [];
				continue;
			}

			const randomMoveIndex = UtilsModule.random(0, allowedMoves.length-1);
			lastMove = allowedMoves[randomMoveIndex];

			result.push(lastMove)
			visited.push(lastMove);
		}
		return new Promise((resolve) => resolve(result));
	}

	generateNewBoard()
	{
		var result;
		do {
			result = UtilsModule.initialBoard.sort(() => Math.round(Math.random())-0.5);
		} while (!UtilsModule.isSolvable(result));

		return new Promise((resolve) => resolve(result));
	}

	solve(board)
	{
		const matrix = UtilsModule.arrayToMatrix(board, 4);
		const emptyTileIndex = board.indexOf(0);
		const emptyTilePosition = UtilsModule.getPositionByIndex(emptyTileIndex, 4)
		var lastMove = emptyTilePosition;

		const result = new Promise((resolve, reject) => {
			const complete = (e) => resolve(e.steps.map(s=>{
				console.log(e);
				const delta = directionToDelta(s);
				lastMove.y+=delta[0];
				lastMove.x+=delta[1];
				return UtilsModule.getIndexByPosition(lastMove, 4);
			}));
			const error = (e) => reject(e);

			
			const grid = new Grid(matrix, [emptyTilePosition.y, emptyTilePosition.x]);
			console.log(grid)
			solve(grid, {complete, error})

		});
		return result;
	}
}

(function() {
  this.originalPosition = function(num) {
    return [parseInt((num - 1) / 4, 10), parseInt((num - 1) % 4, 10)];
  };
  this.rectilinearDistance = function(num, curRow, curCol) {
    var origCol, origRow, _ref;
    _ref = originalPosition(num), origRow = _ref[0], origCol = _ref[1];
    return Math.abs(origRow - curRow) + Math.abs(origCol - curCol);
  };
  this.Grid = (function() {
    function Grid(grid, emptyPos) {
      var row, _i, _len;
      if (grid == null) {
        grid = INIT_GRID;
      }
      if (emptyPos == null) {
        emptyPos = [3, 3];
      }
      this.emptyPos = [].concat(emptyPos);
      this.grid = [];
      for (_i = 0, _len = grid.length; _i < _len; _i++) {
        row = grid[_i];
        this.grid.push([].concat(row));
      }
    }
    Grid.prototype.validMoves = function() {
      var colNum, rowNum, valid, _ref;
      _ref = this.emptyPos, rowNum = _ref[0], colNum = _ref[1];
      valid = [];
      if (colNum !== 0) {
        valid.push(LEFT);
      }
      if (colNum !== 3) {
        valid.push(RIGHT);
      }
      if (rowNum !== 0) {
        valid.push(ABOVE);
      }
      if (rowNum !== 3) {
        valid.push(BELOW);
      }
      return valid;
    };
    Grid.prototype.positionToMove = function(rowNum, colNum) {
      var emptyCol, emptyRow, _ref;
      _ref = this.emptyPos, emptyRow = _ref[0], emptyCol = _ref[1];
      if (rowNum === emptyRow) {
        if (colNum === emptyCol - 1) {
          return LEFT;
        }
        if (colNum === emptyCol + 1) {
          return RIGHT;
        }
      }
      if (colNum === emptyCol) {
        if (rowNum === emptyRow - 1) {
          return ABOVE;
        }
        if (rowNum === emptyRow + 1) {
          return BELOW;
        }
      }
      return null;
    };
    Grid.prototype.applyMoveFrom = function(sourceDirection) {
      var deltaCol, deltaRow, emptyPos, grid, nextGrid, number, row, sourceCol, sourceRow, targetCol, targetRow, _i, _len, _ref, _ref2, _ref3, _ref4;
      _ref = this.emptyPos, targetRow = _ref[0], targetCol = _ref[1];
      _ref2 = directionToDelta(sourceDirection), deltaRow = _ref2[0], deltaCol = _ref2[1];
      emptyPos = (_ref3 = [targetRow + deltaRow, targetCol + deltaCol], sourceRow = _ref3[0], sourceCol = _ref3[1], _ref3);
      grid = [];
      _ref4 = this.grid;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        row = _ref4[_i];
        grid.push([].concat(row));
      }
      grid[targetRow][targetCol] = grid[sourceRow][sourceCol];
      grid[sourceRow][sourceCol] = 0;
      nextGrid = new Grid(grid, emptyPos);
      number = grid[targetRow][targetCol];
      nextGrid._lowerSolutionBound = this.lowerSolutionBound() - rectilinearDistance(number, sourceRow, sourceCol) + rectilinearDistance(number, targetRow, targetCol);
      return nextGrid;
    };
    Grid.prototype.lowerSolutionBound = function() {
      /*
            This calculates a lower bound on the minimum
            number of steps required to solve the puzzle
      
            This is the sum of the rectilinear distances
            from where each number is to where it should
            be
          */      var colNum, moveCount, number, rowNum;
      if (!(this._lowerSolutionBound != null)) {
        moveCount = 0;
        for (rowNum in this.grid) {
          rowNum = parseInt(rowNum, 10);
          for (colNum in this.grid[rowNum]) {
            colNum = parseInt(colNum, 10);
            number = this.grid[rowNum][colNum];
            if (number === 0) {
              continue;
            }
            moveCount += rectilinearDistance(number, rowNum, colNum);
          }
        }
        this._lowerSolutionBound = moveCount;
      }
      return this._lowerSolutionBound;
    };
    Grid.prototype.isSolved = function() {
      return this.lowerSolutionBound() === 0;
    };
    return Grid;
  })();


  this.SolverState = (function() {
    function SolverState(grid, steps) {
      var lowerSolutionBound;
      this.grid = grid;
      lowerSolutionBound = this.grid.lowerSolutionBound();
      this.steps = [].concat(steps);
      this.solved = this.grid.isSolved();
      this.val = lowerSolutionBound + steps.length;
    }
    return SolverState;
  })();
  this.SolverStateMinHeap = (function() {
    SolverStateMinHeap.prototype.maxSize = 100000;
    function SolverStateMinHeap() {
      this.data = [];
    }
    SolverStateMinHeap.prototype.enqueue = function(pt) {
      this.data.push(pt);
      this.bubbleUp(this.data.length - 1);
      if (this.data.length === this.maxSize) {
        return this.data.pop();
      }
    };
    SolverStateMinHeap.prototype.dequeue = function() {
      var end, ret;
      ret = this.data[0];
      end = this.data.pop();
      if (this.data.length > 0) {
        this.data[0] = end;
        this.bubbleDown(0);
      }
      return ret;
    };
    SolverStateMinHeap.prototype.bubbleUp = function(curPos) {
      var cur, parent, parentPos;
      if (curPos === 0) {
        return;
      }
      parentPos = ~~((curPos - 1) / 2);
      cur = this.data[curPos];
      parent = this.data[parentPos];
      if (cur.val < parent.val) {
        this.data[curPos] = parent;
        this.data[parentPos] = cur;
        return this.bubbleUp(parentPos);
      }
    };
    SolverStateMinHeap.prototype.bubbleDown = function(curPos) {
      var cur, left, leftPos, right, rightPos, swapPos;
      leftPos = curPos * 2 + 1;
      rightPos = curPos * 2 + 2;
      cur = this.data[curPos];
      left = this.data[leftPos];
      right = this.data[rightPos];
      swapPos = null;
      if ((left != null) && left.val < cur.val) {
        swapPos = leftPos;
      }
      if ((right != null) && right.val < left.val && right.val < cur.val) {
        swapPos = rightPos;
      }
      if (swapPos != null) {
        this.data[curPos] = this.data[swapPos];
        this.data[swapPos] = cur;
        return this.bubbleDown(swapPos);
      }
    };
    SolverStateMinHeap.prototype.empty = function() {
      return this.data.length === 0;
    };
    return SolverStateMinHeap;
  })();
  this.solve = function(startGrid, _arg) {
    var candidates, complete, curState, error, frontier, grid, its, lastStep, nextGrid, nextState, nextSteps, sourceDirection, startState, steps, _results;
    complete = _arg.complete, error = _arg.error, frontier = _arg.frontier;
        if (complete != null) {
      complete;
    } else {
      complete = $.noop;
    };
        if (error != null) {
      error;
    } else {
      error = $.noop;
    };
    if (!(frontier != null)) {
      frontier = new SolverStateMinHeap;
      startState = new SolverState(startGrid, []);
      frontier.enqueue(startState);
    }
    its = 0;
    _results = [];
    while (!frontier.empty()) {
      its += 1;
      if (its > 1000) {
        setTimeout(function() {
          return solve(startGrid, {
            complete: complete,
            error: error,
            frontier: frontier
          });
        }, 10);
        return;
      }
      curState = frontier.dequeue();
      if (curState.solved) {
        steps = curState.steps;
        complete({
          steps: curState.steps,
          iterations: its
        });
        return;
      }
      grid = curState.grid;
      steps = curState.steps;
      candidates = _shuffle(grid.validMoves());// _.shuffle(grid.validMoves());
      lastStep = steps[steps.length-1];// _.last(steps);
      if (lastStep != null) {
        candidates = candidates.filter(function(x) { //_(candidates).filter(function(x) {
          return !directionsAreOpposites(x, lastStep);
        });
      }
      _results.push((function() {
        var _i, _len, _results2;
        _results2 = [];
        for (_i = 0, _len = candidates.length; _i < _len; _i++) {
          sourceDirection = candidates[_i];
          nextGrid = grid.applyMoveFrom(sourceDirection);
          nextSteps = steps.concat([sourceDirection]);
          nextState = new SolverState(nextGrid, nextSteps);
          _results2.push(frontier.enqueue(nextState));
        }
        return _results2;
      })());
    }
    return _results;
  };


  this.ABOVE = "ABOVE";
  this.RIGHT = "RIGHT";
  this.LEFT = "LEFT";
  this.BELOW = "BELOW";
  this.directionToDelta = function(direction) {
    switch (direction) {
      case ABOVE:
        return [-1, 0];
      case RIGHT:
        return [0, 1];
      case BELOW:
        return [1, 0];
      case LEFT:
        return [0, -1];
    }
  };
  this.directionsAreOpposites = function(a, b) {
    var adc, adr, bdc, bdr, _ref, _ref2;
    _ref = directionToDelta(a), adr = _ref[0], adc = _ref[1];
    _ref2 = directionToDelta(b), bdr = _ref2[0], bdc = _ref2[1];
    return (adr + bdr === 0) && (adc + bdc === 0);
  };
  this._shuffle = function shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;

	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }

	  return array;
	}
}).call(typeof module !== 'undefined' && typeof module.exports !== 'undefined' ? module.exports.JsSolver = {} : this);

if( typeof module !== 'undefined' && typeof module.exports !== 'undefined' ) {
	var Grid = module.exports.JsSolver.Grid;
	var solve = module.exports.JsSolver.solve;
	var SolverStateMinHeap = module.exports.SolverStateMinHeap;
	var rectilinearDistance = module.exports.JsSolver.rectilinearDistance;
	var originalPosition = module.exports.JsSolver.originalPosition;
	var SolverState = module.exports.JsSolver.SolverState;
	var SolverStateMinHeap = module.exports.JsSolver.SolverStateMinHeap;
	var directionToDelta = module.exports.JsSolver.directionToDelta;
	var directionsAreOpposites = module.exports.JsSolver.directionsAreOpposites;
	var _shuffle = module.exports.JsSolver._shuffle;

	var ABOVE = module.exports.JsSolver.ABOVE;
	var RIGHT = module.exports.JsSolver.RIGHT;
	var LEFT = module.exports.JsSolver.LEFT;
	var BELOW = module.exports.JsSolver.BELOW;
	
}
if( typeof exports !== 'undefined' ) {
	if( typeof module !== 'undefined' && module.exports ) {
	  exports = module.exports = LocalSolver
	}
	exports.LocalSolver = LocalSolver
}
