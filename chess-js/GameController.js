// GameController.js
import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        // Cria tabuleiro
        this.board = new Board(); // this.board.board é o array

        // MoveValidator trabalha apenas com o array de 64 casas
        this.validator = new MoveValidator(this.board.board);

        // IA trabalha com board e validator
        this.ai = new AI(this.board, this.validator);

        // View recebe board, ai e controller
        this.view = new View(this.board, this.ai, this);

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        const possibleMoves = this.validator.getPossibleMoves(from);
        if (!possibleMoves.includes(to)) {
            console.log("Movimento inválido:", from, "->", to);
            return false;
        }

        // Executa movimento
        const piece = this.board.board[from];
        this.board.board[to] = piece;
        this.board.board[from] = null;

        this.view.render();

        // IA move após jogador
        setTimeout(() => {
            this.ai.makeMove('pretas');
            this.view.render();
        }, 300);

        return true;
    }
}

console.log("GameController carregado!");
