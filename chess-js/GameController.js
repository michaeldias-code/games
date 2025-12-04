// GameController.js
import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        this.board = new Board();                       // Tabuleiro
        this.validator = new MoveValidator(this.board.board); // Validador de movimentos
        this.ai = new AI(this.board, this.validator);   // IA do jogo

        this.turn = 'brancas'; // controle de turno: 'brancas' ou 'pretas'

        this.view = new View(this.board, this.ai, this); // view recebe o controller

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        const piece = this.board.board[from];

        // só permite mover se houver peça e for turno do jogador
        if (!piece || piece.cor !== this.turn) return;

        // valida movimento
        const validMoves = this.validator.getPossibleMoves(from);
        if (!validMoves.includes(to)) return;

        // executa movimento
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // alterna o turno
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';

        // atualiza a view
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
