var shortID = require('shortid');

module.exports = class Player
{
    constructor()
    {
        this.userName = '';
        this.id = shortID.generate();
    }
}