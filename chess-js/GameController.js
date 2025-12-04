// GameController.js
import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        this.board = new Board();                       
        this.validator = new MoveValidator(this.board.board); // passa o array diretamente
        this.ai = new AI(this.board, this.validator);  

        this.turn = 'brancas'; 

        this.view = new View(this.board, this.ai, this); 

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        const piece = this.board.board[from];

        if (!piece || piece.cor !== this.turn) return;

        const validMoves = this.validator.getPossibleMoves(from);
        if (!validMoves.includes(to)) return;

        // executa o movimento
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // alterna turno
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';

        this.view.render();

        if (this.turn === 'pretas') {
            setTimeout(() => {
                // IA usa validator para pegar movimentos
                const move = this.ai.getRandomMove('pretas');
                if (move) {
                    this.board.board[move.to] = this.board.board[move.from];
                    this.board.board[move.from] = null;
                }
                this.turn = 'brancas';
                this.view.render();
            }, 300);
        }
    }
}
