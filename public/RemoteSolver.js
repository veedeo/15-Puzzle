"use strict";

class RemoteSolver {
	getRandomMoves(emptyTilePosition, moves)
	{
		return new Promise((resolve, reject) => {
			this.callApi('getRandomMoves', { emptyTilePosition, moves })
				.then(data => resolve(data))
				.catch(e => reject(e));
		});
	}

	generateNewBoard()
	{
		return new Promise((resolve, reject) => {
			this.callApi('generateNewBoard')
				.then(data => resolve(data))
				.catch(e => reject(e));
		});
	}

	solve(board)
	{
		return new Promise((resolve, reject) => {
			this.callApi('solve', { board })
				.then(data => resolve(data))
				.catch(e => reject(e));
		});
	}

	callApi(url, params)
	{
		return new Promise((resolve, reject) => {
			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function() {
			    if (this.readyState == 4)
			    {
		    		if (this.status == 200) {
				        var data = JSON.parse(this.responseText);
				        resolve(data);
				    }
				    else
				    	reject('error');
				}
			};

			var query = Object.keys(params || {}).map((k) => `${k}=${encodeURIComponent(params[k])}`).join('&');
			if (query)
				query='?'+query;

			xmlhttp.open("GET", url + query, true);
			xmlhttp.send();
		});
	}
}