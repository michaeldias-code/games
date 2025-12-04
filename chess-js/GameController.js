// GameController.js
import { Board } from './Board.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log('GameController inicializando...');
        this.board = new Board();
        this.ai = new AI(this.board);
        this.view = new View(this.board, this.ai, this);
        console.log('GameController carregado!');
    }

    movePiece(from, to) {
        const success = this.board.movePiece(from, to);
        if (success) this.view.render();
        return success;
    }
}
