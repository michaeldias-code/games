// GameController.js
import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        this.board = new Board();
        this.validator = new MoveValidator(this.board.board);
        this.ai = new AI(this.board, this.validator);

        this.turn = 'brancas'; // controle de turno

        this.view = new View(this.board, this.ai, this);

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        // só permite mover se for turno do jogador
        const piece = this.board.board[from];
        if (!piece || piece.cor !== this.turn) return;

        // mover peça via validator
        const validMoves = this.validator.getPossibleMoves(from);
        if (!validMoves.includes(to)) return;

        // executar movimento
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // mudar turno
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';

        this.view.render();

        // se agora for turno da IA, ela joga automaticamente
        if (this.turn === 'pretas') {
            setTimeout(() => {
                this.ai.makeMove('pretas');
                this.turn = 'brancas';
                this.view.render();
            }, 300);
        }
    }
}
