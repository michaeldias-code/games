// GameController.js
import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        this.board = new Board();          // AQUI!!!
        this.validator = new MoveValidator(this.board);
        this.ai = new AI(this.board, this.validator);

        this.view = new View(this.board, this.ai, this);

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        this.validator.movePiece(from, to);
        this.view.render();
    }
}
