"use strict";

class Utils {
	static get initialBoard()
	{
		return [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
	}

	static getPositionByIndex(index, xLength)
	{
		const y = Math.floor((index)/xLength);
		const x = (index)%xLength;

		return {x, y};
	}
	static getIndexByPosition(position, xLength)
	{
		return position.y*xLength+position.x;
	}
	static isSolved(arr)
	{
		if (arr[15] != 0)
			return false;

		for (var i = 0; i < arr.length - 2; i++) {
		    if (arr[i] > arr[i+1]) {
		        return false;
		    }
		}
		return true;

	}
	static getAdjacents(index, xLength)
	{
		const position = Utils.getPositionByIndex(index, xLength);
		
		var result = [];

		if (position.x > 0)
			result.push({x: position.x-1, y: position.y});
		if (position.y > 0)
			result.push({x: position.x, y: position.y-1});
		if (position.x < xLength-1)
			result.push({x: position.x+1, y: position.y});
		if (position.y < xLength-1)
			result.push({x: position.x, y: position.y+1});
		
		return result.map(c=>Utils.getIndexByPosition(c, xLength));
	}
	static random(from, to){
		return Math.floor(Math.random() * (to - from + 1)) + from;
	}
	static arrayToMatrix(list, elementsPerSubArray)
	{
		var matrix = [], i, k;

	    for (i = 0, k = -1; i < list.length; i++) {
	        if (i % elementsPerSubArray === 0) {
	            k++;
	            matrix[k] = [];
	        }

	        matrix[k].push(list[i]);
	    }

	    return matrix;
	}
	static isSolvable(puzzle){
		var parity = 0;
	    var gridWidth = Math.sqrt(puzzle.length);
	    var row = 0; // the current row we are on
	    var blankRow = 0; // the row with the blank tile

	    for (var i = 0; i < puzzle.length; i++)
	    {
	        if (i % gridWidth == 0) { // advance to next row
	            row++;
	        }
	        if (puzzle[i] == 0) { // the blank tile
	            blankRow = row; // save the row on which encountered
	            continue;
	        }
	        for (var j = i + 1; j < puzzle.length; j++)
	        {
	            if (puzzle[i] > puzzle[j] && puzzle[j] != 0)
	            {
	                parity++;
	            }
	        }
	    }

	    if (gridWidth % 2 == 0) { // even grid
	        if (blankRow % 2 == 0) { // blank on odd row; counting from bottom
	            return parity % 2 == 0;
	        } else { // blank on even row; counting from bottom
	            return parity % 2 != 0;
	        }
	    } else { // odd grid
	        return parity % 2 == 0;
	    }
	}
}

if( typeof exports !== 'undefined' ) {
	if( typeof module !== 'undefined' && module.exports ) {
	  exports = module.exports = Utils
	}
	exports.Utils = Utils
}