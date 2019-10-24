// Import class
var io = require('socket.io')(process.env.PORT || 8888);
var Player = require('./Player');
var Room = require('./Room');
var Tile = require('./Tile');
var GenerateTileController = require('./GenerateTileController');
var NetworkCommand = require('./NetworkCommand');

console.log(io);
console.log('server has started');

var players = [];
var sockets = [];
var rooms = [];
var waitingPlayers = [];
var generateTileController = new GenerateTileController();

// Random function
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Detec when have new connection
io.on('connection', (socket) => {
    console.log('Have a player connected');
    var player = new Player();
    var playerID = player.id;

    players[playerID] = player;
    sockets[playerID] = socket;

    // Return id to player
    socket.emit(NetworkCommand.register, { id: playerID });

    // Detech player register name
    socket.on(NetworkCommand.registerName, (data) => {
        var name = data.name;
        player.userName = name;
        console.log('register name: %s', name);
    });

    socket.on(NetworkCommand.startMatchMaking, () => {
        waitingPlayers[playerID] = player;
        var numsPlayerWaiting = Object.keys(waitingPlayers).length;

        console.log('players waiting: %i', numsPlayerWaiting);
        if (numsPlayerWaiting >= 2) {
            var room = new Room();

            rooms[room.id] = room;
            // Delete room callback
            room.deleteRoomCallBack = () => {
                console.log("Delete room");
                delete rooms[room.id];
            }
            room.player1 = player;

            // Find another player
            for (var key in waitingPlayers) {
                var value = waitingPlayers[key];
                if (value.id != playerID) {
                    room.player2 = value;
                    break;
                }
            }

            // Bind socket to room
            room.socket1 = socket;
            room.socket2 = sockets[room.player2.id];

            // Delete in waiting list
            delete waitingPlayers[room.player1.id];
            delete waitingPlayers[room.player2.id];

            // Emit start game on 2 player
            console.log(room.player1.userName);
            console.log(room.player2.userName);
            room.socket1.emit(NetworkCommand.startGame, room.player2);
            room.socket2.emit(NetworkCommand.startGame, room.player1);

            // Generate list tile
            var tiles = [];

            for (var i = 0; i < 1000; i++) {
                var value = generateTileController.GetRandomTile();
                tiles.push(value);
            }
            // Send list tile
            room.socket1.emit(NetworkCommand.generateTile, { list: tiles });
            room.socket2.emit(NetworkCommand.generateTile, { list: tiles });
        }
    })

    socket.on(NetworkCommand.canceltMatchMaking, () => {
        delete waitingPlayers[playerID];
        console.log('Player %s cancel match making', player.userName);
    })

    socket.on(NetworkCommand.updateBoard, (data) => {
        var roomValue = GetRoomHaveSocket(socket);
        var opponentSocket = roomValue.getOpponentSocket(socket);
        opponentSocket.emit(NetworkCommand.updateBoard, data);
    })

    socket.on(NetworkCommand.updateScore, (data) => {
        var room = GetRoomHaveSocket(socket);
        var opponentSocket = room.getOpponentSocket(socket);
        opponentSocket.emit(NetworkCommand.updateScore, data);

        // Update score in room
        var score = data["score"];
        if (room.player1.id == playerID) {
            room.player1Score = score;
        } else {
            room.player2Score = score;
        }

    })

    socket.on(NetworkCommand.exitRoom, ()=>
    {
        HandleExitRoom(socket,playerID);
        console.log("Have a player exit room");
    })

    socket.on('disconnect', () => {
        HandleExitRoom(socket,playerID);

        // Delete player in list
        delete players[playerID];
        delete sockets[playerID];
        delete waitingPlayers[playerID];

        console.log('disconnected');
    })
});
function HandleExitRoom(socket, playerID) {

    // Delete room if have a player quit
    var roomHaveSocket = GetRoomHaveSocket(socket);
    if (roomHaveSocket != null) {
        // Send win to the other player
        if (roomHaveSocket.player1.id == playerID) {
            roomHaveSocket.setPlayerWin(2);
        } else
        {
            roomHaveSocket.setPlayerWin(1);
        }

        roomHaveSocket.deleteRoom();
    }

}
function GetRoomHaveSocket(socket) {
    for (var room in rooms) {
        var roomValue = rooms[room];
        if (roomValue.hasSocket(socket)) {
            return roomValue;
        }
    }
    return null;
}
