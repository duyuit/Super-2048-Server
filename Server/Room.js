var shortID = require('shortid');
var Player = require('./Player');
var NetworkCommand = require('./NetworkCommand');

module.exports = class Room {
    constructor() {
        this.player1 = null;
        this.player2 = null;
        this.socket1 = null;
        this.socket2 = null;
        this.id = shortID.generate();
        this.timer = 15;
        this.player1Score = 0;
        this.player2Score = 0;


        // setTimeout(() => {
        //     console.log("Time out!");
        // }, 60000);
        this.interValID = setInterval(() => {
            if (this.socket1 != null)
                this.socket1.emit(NetworkCommand.updateTimer, { time: this.timer });
            if (this.socket2 != null)
                this.socket2.emit(NetworkCommand.updateTimer, { time: this.timer });
            this.timer--;
            if(this.timer == -1)
            {
                this.onEndGame();
                this.deleteRoom();
            }
        }, 1000);
    }
    onEndGame()
    {
        //this.socket1.emit(NetworkCommand.endGame);
        //this.socket2.emit(NetworkCommand.endGame);
        // -1 -> LOSE
        // 0 -> DRAW
        // 1 -> Win
        if (this.player1Score > this.player2Score)
        {
            console.log("Player1 win");
            this.socket1.emit(NetworkCommand.endGame,{result: 1});
            this.socket2.emit(NetworkCommand.endGame,{result: -1});
        }
        else if(this.player2Score > this.player1Score)
        {
            console.log("Player2 win");
            this.socket2.emit(NetworkCommand.endGame,{result: 1});
            this.socket1.emit(NetworkCommand.endGame,{result: -1});
        }
        else
        {
            console.log("Draw");
            this.socket1.emit(NetworkCommand.endGame,{result: 0});
            this.socket2.emit(NetworkCommand.endGame,{result: 0});
        }
    }
    deleteRoom()
    {
        clearInterval(this.interValID);
        this.deleteRoomCallBack();
    }
    deleteRoomCallBack()
    {

    }

    hasSocket(socket) {
        return this.socket1 == socket || this.socket2 == socket;
    }
    setPlayerWin(player)
    {
        if (player == 1)
        {
            console.log("Player1 win");
            this.socket1.emit(NetworkCommand.endGame,{result: 1});
            this.socket2.emit(NetworkCommand.endGame,{result: -1});
        }
        else if(player == 2)
        {
            console.log("Player2 win");
            this.socket2.emit(NetworkCommand.endGame,{result: 1});
            this.socket1.emit(NetworkCommand.endGame,{result: -1});
        }
        else
        {
            console.log("Draw");
            this.socket1.emit(NetworkCommand.endGame,{result: 0});
            this.socket2.emit(NetworkCommand.endGame,{result: 0});
        }
    }

    getOpponentSocket(socket) {
        if (this.socket1 == socket)
            return this.socket2;
        else return this.socket1;
    }

}