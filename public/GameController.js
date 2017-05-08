"use strict";

class GameController
{
	constructor({puzzleSolver, historyProvider=new History()}){
		this.puzzleSolver = puzzleSolver;
		
		this.history = historyProvider;
		this.history.setEventListener(this.onHistoryChange.bind(this));

		this.board = new Board();
	}
	init()
	{
		this.dispatchBoardChange();
	}
	setEventListener(callback)
	{
		this.moveListener = callback;
	}
	
	dispatch(event)
	{
		if (this.moveListener)
			this.moveListener(event);
	}
	onHistoryChange(tiles)
	{
		this.board.update(tiles);
		this.dispatchBoardChange(false)
	}
	dispatchBoardChange(saveHistory=true)
	{
		if (saveHistory)
			this.history.update(this.board.getTiles());

		this.dispatch({
			type: 'UPDATE_TILES',
			board: this.board.getTiles()
		});

		if (this.board.isSolved())
			this.dispatch({type: 'WIN'});
	}

	moveTile(positionIndex, resetSolution = true)
	{
		if (resetSolution)
			this.hasSolution = false;

		const success = this.board.moveTile(positionIndex);
		if (!success)
		{
			console.log('bad move');
			return
		}
		
		this.dispatchBoardChange();
	}
	newGame()
	{
		this.hasSolution = false;
		this.dispatch({type: 'BUSY_STATUS', status: true});

		this.puzzleSolver
			.generateNewBoard()
			.then(tiles => {
				this.dispatch({type: 'BUSY_STATUS', status: false});
				this.history.clear();
				this.board.update(tiles);
				this.dispatchBoardChange();
			})
			.catch(() => this.dispatch({type: 'BUSY_STATUS', status: false}))
	}
	shuffle()
	{
		this.hasSolution = false;

		const empyTilePosition = this.board.getEmptyTilePosition(0);
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
				.solve(this.board.getTiles())
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
		this.hasSolution = false;
		this.history.undo();
	}

	redo()
	{
		this.hasSolution = false;
		this.history.redo();
	}
}

class History
{
	constructor()
	{
		this.clear();
	}

	setEventListener(callback)
	{
		this.eventListener = callback;
	}

	clear()
	{
		this.undos = [];
		this.undoPosition = -1;
	}
	update(board)
	{
		if (this.undoPosition >= 0 && Utils.arraysEqual(this.undos[this.undoPosition], board))
			return false;

		if (this.undoPosition < this.undos.length-1)
			this.undos = this.undos.slice(0, this.undoPosition+1);

		this.undos.push(board);
		this.undoPosition++;

		return true;
	}
	undo()
	{
		if (this.undoPosition <= 0)
			return;

		this.undoPosition--;
		if (this.eventListener)
			this.eventListener(this.undos[this.undoPosition]);
	}
	redo()
	{
		if (this.undoPosition >= this.undos.length-1)
			return;

		this.undoPosition++;
		if (this.eventListener)
			this.eventListener(this.undos[this.undoPosition]);
	}
}

class RemoteHistory extends History
{
	constructor(firebaseDb, roomName='default')
	{
		super();
		this.firebaseDb = firebaseDb;
		this.roomName = roomName;

		this.firebaseDb
			.ref('puzzle15/' + this.roomName)
			.on('value', (snapshot) => {
				if (this.eventListener)
					this.eventListener(snapshot.val());
			});
	}
	update(board)
	{
		firebase.database().ref('puzzle15/' + this.roomName).set(board);
	}
	clear()
	{
	}
	undo()
	{
	}
	redo()
	{
	}
}

class Board
{
	constructor(tiles=Board.initialBoard, size=4)
	{
		this.size = size;
		this.tiles = tiles;
	}
	static get initialBoard()
	{
		return [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
	}

	getTiles()
	{
		return this.tiles.slice();
	}

	getEmptyTilePosition()
	{
		return this.tiles.indexOf(0);
	}

	moveTile(positionIndex)
	{
		const empyTilePosition = this.getEmptyTilePosition();
		const adjacents = Utils.getAdjacents(positionIndex, this.size);
		
		// bad move
		if (adjacents.indexOf(empyTilePosition) < 0)
		{
			return false;
		}

		this.tiles[empyTilePosition] = this.tiles[positionIndex];
		this.tiles[positionIndex] = 0;

		return true;
	}

	isSolved()
	{
		return Utils.isSolved(this.tiles);
	}

	update(tiles)
	{
		this.tiles = tiles.slice();
	}
}