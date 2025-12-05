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

        // View recebe board e controller
        this.view = new View(this.board, this);

        console.log("GameController carregado!");
    }

    // Função chamada pelo View quando o jogador tenta mover
    movePiece(from, to) {
        const possibleMoves = this.validator.getPossibleMoves(from);

        if (!possibleMoves.includes(to)) {
            console.log("Movimento inválido:", from, "->", to);
            return false;
        }

        // Executa o movimento
        const piece = this.board.board[from];
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // Atualiza a interface
        this.view.render();

        // Depois do jogador, IA joga
        setTimeout(() => {
            this.ai.makeMove('pretas');
            this.view.render();
        }, 300);

        return true;
    }
}

console.log("GameController carregado!");
