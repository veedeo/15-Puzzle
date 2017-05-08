# wix-15-puzzle
15 Puzzle game developed as a coding challenge for a job interview at Wix.
Tested on Chrome mobile/desktop

Everything is written in VanillaJS without any third party libraries.
Solving algorithm was found on the net and ported to ES6 classes. It yields the optimal solution (fewest number of moves)

### Demo 
 - https://wix-15-puzzle.herokuapp.com since the solver is hosted on free heroku instance, solving heavily randomized puzzle may result in timeout, use shuffle insted
 - https://wix-15-puzzle.herokuapp.com/js.html  solves puzzle in browser without backend
 - https://wix-15-puzzle.herokuapp.com/remote.html realtime shared history (multiplayer), leverages extensibility of the design to showcase how easy it is to add realtime support
(open in few browsers and start playing)


#### UI consist from the above classes:
 - VanillaUI - processes events and controls tiles
 - Tile - renders tiles
 - RenderQueue - execution queue with delay, used to nicely play tile moves

#### Logic:
 - GameController - game logic internally uses:
 - Utils - static class with helpfull utilities
 - History - implements undo/redo logic
 - RemoteHistory - realtime history state via firebase
 - Board - board manipulation
 - RemoteSolver - a proxy class for HTTP api to solve the puzzle
 - OptimalSolver - solves the puzzle in browser and NodeJs

#### Backend
 - NodeJs server with express module, uses OptimalSolver
