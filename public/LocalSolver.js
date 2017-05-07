"use strict";

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
				const delta = AStarSolver.directionToDelta(s);
				lastMove.y+=delta[0];
				lastMove.x+=delta[1];
				return UtilsModule.getIndexByPosition(lastMove, 4);
			}));
			const error = (e) => reject(e);

			
			const grid = new Grid(matrix, [emptyTilePosition.y, emptyTilePosition.x]);
			console.log(grid)
			AStarSolver.solve(grid, {complete, error})

		});
		return result;
	}
}

/* AStar with ma */
class SolverState
{
  constructor(grid, steps)
  {
    var lowerSolutionBound;
    this.grid = grid;
    lowerSolutionBound = this.grid.lowerSolutionBound();
    this.steps = [].concat(steps);
    this.solved = this.grid.isSolved();
    this.val = lowerSolutionBound + steps.length;
  }
}

class Grid
{
  constructor(grid, emptyPos)
  {
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
  validMoves()
  {
    var colNum, rowNum, valid, _ref;
    _ref = this.emptyPos, rowNum = _ref[0], colNum = _ref[1];
    valid = [];
    if (colNum !== 0) {
      valid.push(AStarSolver.LEFT);
    }
    if (colNum !== 3) {
      valid.push(AStarSolver.RIGHT);
    }
    if (rowNum !== 0) {
      valid.push(AStarSolver.ABOVE);
    }
    if (rowNum !== 3) {
      valid.push(AStarSolver.BELOW);
    }
    return valid;
  }
  positionToMove(rowNum, colNum)
  {
    var emptyCol, emptyRow, _ref;
    _ref = this.emptyPos, emptyRow = _ref[0], emptyCol = _ref[1];
    if (rowNum === emptyRow) {
      if (colNum === emptyCol - 1) {
        return AStarSolver.LEFT;
      }
      if (colNum === emptyCol + 1) {
        return AStarSolver.RIGHT;
      }
    }
    if (colNum === emptyCol) {
      if (rowNum === emptyRow - 1) {
        return AStarSolver.ABOVE;
      }
      if (rowNum === emptyRow + 1) {
        return AStarSolver.BELOW;
      }
    }
    return null;
  }
  applyMoveFrom(sourceDirection)
  {
    var deltaCol, deltaRow, emptyPos, grid, nextGrid, number, row, sourceCol, sourceRow, targetCol, targetRow, _i, _len, _ref, _ref2, _ref3, _ref4;
    _ref = this.emptyPos, targetRow = _ref[0], targetCol = _ref[1];
    _ref2 = AStarSolver.directionToDelta(sourceDirection), deltaRow = _ref2[0], deltaCol = _ref2[1];
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
    nextGrid._lowerSolutionBound = this.lowerSolutionBound() - AStarSolver.rectilinearDistance(number, sourceRow, sourceCol) + AStarSolver.rectilinearDistance(number, targetRow, targetCol);
    return nextGrid;
  }

  /*
    This calculates a lower bound on the minimum
    number of steps required to solve the puzzle

    This is the sum of the rectilinear distances
    from where each number is to where it should
    be
  */      
  lowerSolutionBound()
  {
      var colNum, moveCount, number, rowNum;
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
            moveCount += AStarSolver.rectilinearDistance(number, rowNum, colNum);
          }
        }
        this._lowerSolutionBound = moveCount;
      }
      return this._lowerSolutionBound;
  }
  isSolved()
  {
    return this.lowerSolutionBound() === 0;
  }
}

class SolverStateMinHeap
{
  constructor()
  {
    this.maxSize = 100000;
    this.data = [];
  }
  enqueue(pt)
  {
    this.data.push(pt);
    this.bubbleUp(this.data.length - 1);
    if (this.data.length === this.maxSize) {
      return this.data.pop();
    }
  }
  dequeue()
  {
    var end, ret;
    ret = this.data[0];
    end = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = end;
      this.bubbleDown(0);
    }
    return ret;
  }
  bubbleUp(curPos)
  {
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
  }
  bubbleDown(curPos)
  {
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
  }
  empty()
  {
    return this.data.length === 0;
  }
}

class AStarSolver
{
  static originalPosition(num)
  {
    return [parseInt((num - 1) / 4, 10), parseInt((num - 1) % 4, 10)];
  }
  static rectilinearDistance(num, curRow, curCol)
  {
    var origCol, origRow, _ref;
    _ref = AStarSolver.originalPosition(num), origRow = _ref[0], origCol = _ref[1];
    return Math.abs(origRow - curRow) + Math.abs(origCol - curCol);
  }
  
  static get ABOVE() { return "ABOVE"; };
  static get RIGHT() { return "RIGHT"; };
  static get LEFT() { return "LEFT"; };
  static get BELOW() { return "BELOW"; };
  
  static directionToDelta(direction) {
    switch (direction) {
      case AStarSolver.ABOVE:
        return [-1, 0];
      case AStarSolver.RIGHT:
        return [0, 1];
      case AStarSolver.BELOW:
        return [1, 0];
      case AStarSolver.LEFT:
        return [0, -1];
    }
  };
  static directionsAreOpposites(a, b) {
    var adc, adr, bdc, bdr, _ref, _ref2;
    _ref = AStarSolver.directionToDelta(a), adr = _ref[0], adc = _ref[1];
    _ref2 = AStarSolver.directionToDelta(b), bdr = _ref2[0], bdc = _ref2[1];
    return (adr + bdr === 0) && (adc + bdc === 0);
  };

  static _shuffle(array) {
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

  static solve(startGrid, _arg) {
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
          return AStarSolver.solve(startGrid, {
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
      candidates = AStarSolver._shuffle(grid.validMoves());// _.shuffle(grid.validMoves());
      lastStep = steps[steps.length-1];// _.last(steps);
      if (lastStep != null) {
        candidates = candidates.filter(function(x) { //_(candidates).filter(function(x) {
          return !AStarSolver.directionsAreOpposites(x, lastStep);
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
}


/* Enables import from both Browser and NodeJs */
var UtilsModule = typeof module !== 'undefined' ? require('./Utils.js') : Utils;
if( typeof exports !== 'undefined' ) {
	if( typeof module !== 'undefined' && module.exports ) {
	  exports = module.exports = LocalSolver
	}
	exports.LocalSolver = LocalSolver
}
