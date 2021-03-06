const express = require("express");
const OptimalSolver = require("./public/OptimalSolver");

const app = express();

//app.use('/api', [MeetupRoutes, GroupRoutes, UserRoutes]);
app.use(express.static(__dirname + '/public'));

app.get('/generateNewBoard', function (req, res) {
	const puzzleSolver = new OptimalSolver();
	
	puzzleSolver
		.generateNewBoard()
		.then(data => res.json(data));
})

app.get('/getRandomMoves', function (req, res) {
	const puzzleSolver = new OptimalSolver();
	
	puzzleSolver
		.getRandomMoves(req.query.emptyTilePosition, req.query.moves)
		.then(data => res.json(data));
})

app.get('/solve', function (req, res) {
	console.log('solve', req.query)
	const puzzleSolver = new OptimalSolver();
	
	puzzleSolver
		.solve(JSON.parse('['+req.query.board+']'))
		.then(data => res.json(data));
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`App listen to port: ${PORT}`);
  }
});