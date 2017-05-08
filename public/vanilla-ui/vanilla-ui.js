"use strict";

class VanillaUI
{
	constructor({rootElement, gameController}) {
		this.rootElement = rootElement;
		this.gameController = gameController;
		this.gameController.setEventListener(this.onGameEvent.bind(this));
		
		document
			.getElementById('new')
			.addEventListener('click', () => this.gameController.newGame());

		document
			.getElementById('shuffle')
			.addEventListener('click', () => this.gameController.shuffle());

		document
			.getElementById('help')
			.addEventListener('click', () => this.gameController.help());

		document
			.getElementById('solve')
			.addEventListener('click', () => this.gameController.solve());

		document
			.getElementById('undo')
			.addEventListener('click', () => this.gameController.undo());
		document
			.getElementById('redo')
			.addEventListener('click', () => this.gameController.redo());

		this.tiles = {};
		this.renderQueue = new RenderQueue(80);
	}
	onGameEvent(event)
	{
		this.renderQueue.enqueue(()=>this.proccessEvent(event));
	}
	proccessEvent(event)
	{
		switch(event.type) {
		    case 'UPDATE_TILES':
		        this.renderMove(event.board);
		        break;
		    case 'BUSY_STATUS':
		        document.body.className = event.status ? 'busy' : '';
		        break;
	        case 'WIN':
		        new Audio('vanilla-ui/win.mp3').play();
		        break;
		    default:
		        console.log('unknown event', event)
		}
	}

	renderMove(moves)
	{
		for(var i = 0; i < moves.length; i++)
		{
			const tileNumber = moves[i];
			if (tileNumber == 0)
				continue;

			const tile = this.getOrCreateTile(tileNumber, i);
			// reposition moved tiles only
			if (tile.position != i)
			{
				tile.setPosition(i);
				new Audio('vanilla-ui/card-flip.mp3').play();
			}
		}
		
	}

	getOrCreateTile(tileNumber, initialPosition)
	{
		return this.tiles[tileNumber] || (this.tiles[tileNumber] = new Tile(this.rootElement, tileNumber, initialPosition, (tile)=>{
			this.gameController.moveTile(tile.position);
		}));
	}
}

class RenderQueue
{
	constructor(delay) {
		this.delay = delay;
		this.queue = [];
		this.running = false;
	}

	enqueue(task)
	{
		this.queue.push(task);
		if (!this.running)
			this._execute();
	}
	_execute()
	{
		this.running = true;
		const task = this.queue.shift();
		task.call();
		
		setTimeout(()=>{
			if (this.queue.length > 0)
				this._execute();
			else
				this.running = false;
		}, this.delay);
	}
}

class Tile
{
	constructor(rootElement, tileNumber, position, onClick) {
		this.rootElement = rootElement;
		this.tileNumber = tileNumber;
		this.position = position;

		const pos = Utils.getPositionByIndex(position, 4);
		const initialPosition = Utils.getPositionByIndex(tileNumber-1, 4);

		const cell = document.createElement('span');
		cell.id = 'cell-' + tileNumber
		cell.style.left = (pos.x*80+pos.x*5)+'px';
		cell.style.top = (pos.y*80+pos.y*5)+'px';
		cell.classList.add('number');
		cell.classList.add((initialPosition.y%2==0 && initialPosition.x%2>0 || initialPosition.y%2>0 && initialPosition.x%2==0) ? 'dark' : 'light');
		cell.innerHTML = tileNumber;
		this.cell = cell;

		this.rootElement.appendChild(this.cell);

		this.cell.addEventListener('click', (e) => {
			if (onClick)
				onClick(this);
		});
	}

	setPosition(index)
	{
		this.position = index;
		const pos = Utils.getPositionByIndex(index, 4);
		this.cell.style.left = (pos.x*80+pos.x*5)+'px';
		this.cell.style.top = (pos.y*80+pos.y*5)+'px';
	}
}