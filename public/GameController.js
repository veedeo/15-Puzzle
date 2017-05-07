"use strict";

class GameController
{
	constructor({puzzleSolver}){
		this.puzzleSolver = puzzleSolver;
		this.clearUndo();
	}
	init()
	{
		this.updateBoard(Utils.initialBoard);
	}
	setListener(callback)
	{
		this.moveListener = callback;
	}
	clearUndo()
	{
		this.undos = [];
		this.undoPosition = -1;
	}
	dispatch(event)
	{
		if (this.moveListener)
			this.moveListener(event);
	}
	updateBoard(board, saveUndo = true)
	{
		if (saveUndo)
		{
			if (this.undoPosition < this.undos.length-1)
				this.undos = this.undos.slice(0, this.undoPosition+1);

			this.undos.push(board);
			this.undoPosition++;
		}
		
		this.board = board;
		this.dispatch({type: 'UPDATE_TILES', board});

		if (Utils.isSolved(board))
			this.dispatch({type: 'WIN'});

	}

	moveTile(positionIndex, resetSolution = true)
	{
		if (resetSolution)
			this.hasSolution = false;

		const empyTilePosition = this.board.indexOf(0);
		const adjacents = Utils.getAdjacents(positionIndex, 4);
		if (adjacents.indexOf(empyTilePosition) < 0)
		{
			console.log('bad move')
			return;
		}

		var board = this.board.slice();
		board[empyTilePosition] = board[positionIndex];
		board[positionIndex] = 0;
		
		this.updateBoard(board);
	}
	newGame()
	{
		this.hasSolution = false;
		this.dispatch({type: 'BUSY_STATUS', status: true});
		this.puzzleSolver
			.generateNewBoard()
			.then(board => {
				this.dispatch({type: 'BUSY_STATUS', status: false});
				this.clearUndo();
				this.updateBoard(board, true);				
			})
			.catch(() => this.dispatch({type: 'BUSY_STATUS', status: false}))
	}
	shuffle()
	{
		this.hasSolution = false;
		const empyTilePosition = this.board.indexOf(0);
		this.puzzleSolver.getRandomMoves(empyTilePosition, 40).then(moves=>{
			for(var i = 0; i < moves.length; i++){
				this.moveTile(moves[i]);
			}
		})
	}
	help(solve = false)
	{
		if (!this.hasSolution)
		{
			this.dispatch({type: 'BUSY_STATUS', status: true});
			this.puzzleSolver
				.solve(this.board)
				.then(solution => {
					console.log('got solution', solution);
					this.dispatch({type: 'BUSY_STATUS', status: false});
					this.hasSolution = true;
					this.solvedSolution = solution.slice();
					this.help(solve);
				})
				.catch(() => this.dispatch({type: 'BUSY_STATUS', status: false}))
			return;
		}

		if (this.solvedSolution.length > 0)
		{
			const nextStep = this.solvedSolution.shift();
			this.moveTile(nextStep, false);
			if (solve)
				this.help(solve);
			return;
		}
		this.hasSolution = false;
	}
	solve()
	{
		this.help(true);
	}

	undo()
	{
		if (this.undoPosition <= 0)
			return;

		this.hasSolution = false;

		this.undoPosition--;
		this.updateBoard(this.undos[this.undoPosition], false);
	}

	redo()
	{
		if (this.undoPosition >= this.undos.length-1)
			return;

		this.hasSolution = false;

		this.undoPosition++;
		this.updateBoard(this.undos[this.undoPosition], false);
	}
}
