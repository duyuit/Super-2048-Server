const randomFloat = require('random-float');

module.exports = class GenerateTileController {
    constructor() {
        this.starItemPercent = 0.8;
        this.bombItemPercent = 0.6;
        this.blackHoleItemPercent = 0.4;
        this.number4Percent = 10;
        this.number2Percent = 100 - this.number4Percent - this.bombItemPercent - this.blackHoleItemPercent - this.starItemPercent;
    }

    GetRandomTile() {
        // Get a random value from 0 - 100
        var number = randomFloat(100);
        var tileValue;

        if (number < this.number2Percent) {
            tileValue = 2;
        }
        else if (number < this.number2Percent + this.number4Percent) {
            tileValue = 4;
        }
        else if (number < this.number2Percent + this.number4Percent + this.starItemPercent) {
            // Star
            tileValue = 16;
        }
        else if (number < this.number2Percent + this.number4Percent + this.starItemPercent + this.bombItemPercent) {
            // Bomb
            tileValue = 32;
        }
        else if (number < this.number2Percent + this.number4Percent + this.starItemPercent + this.bombItemPercent + this.blackHoleItemPercent) {
            // Black Hole
            tileValue = 64;
        }
        return tileValue;
    }
}