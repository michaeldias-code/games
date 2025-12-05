// GameController.js
import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        // Cria o tabuleiro
        this.board = new Board(); // this.board.board é o array de 64 casas

        // Validator trabalha apenas com o array
        this.validator = new MoveValidator(this.board.board);

        // IA trabalha com board e validator
        this.ai = new AI(this.board, this.validator);

        // Define turno inicial
        this.currentTurn = 'brancas';

        // View recebe board, ai e controller (controller completo já está inicializado)
        this.view = new View(this.board, this.ai, this);

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        const piece = this.board.board[from];
        if (!piece) return false;

        // Confirma que é a vez da cor da peça
        if (piece.cor !== this.currentTurn) {
            console.log(`Não é a vez de ${piece.cor}`);
            return false;
        }

        // Obtém movimentos possíveis
        let possibleMoves = this.validator.getPossibleMoves(from);

        // Filtra movimentos que deixam o rei em xeque
        possibleMoves = possibleMoves.filter(dest => {
            const snapshot = this.board.board.slice();
            snapshot[dest] = snapshot[from];
            snapshot[from] = null;

            // Cria validator temporário para simular a jogada
            const tempValidator = new MoveValidator(snapshot);
            return !tempValidator.isKingInCheck(piece.cor);
        });

        if (!possibleMoves.includes(to)) {
            console.log(`Movimento inválido: ${from} -> ${to}`);
            return false;
        }

        // Executa o movimento
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // Renderiza o tabuleiro
        this.view.render();

        // Alterna turno
        this.currentTurn = this.currentTurn === 'brancas' ? 'pretas' : 'brancas';

        // Se for turno da IA, aciona automaticamente
        if (this.currentTurn === 'pretas') {
            setTimeout(() => {
                this.ai.makeMove('pretas');
                this.view.render();
                this.currentTurn = 'brancas';
            }, 300);
        }

        return true;
    }
}

console.log("GameController carregado!");
