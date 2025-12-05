import { Board } from './Board.js';
import { MoveValidator } from './MoveValidator.js';
import { AI } from './AI.js';
import { View } from './View.js';

export class GameController {
    constructor() {
        console.log("GameController inicializando...");

        // Cria tabuleiro
        this.board = new Board(); // this.board.board é o array de 64 casas

        // MoveValidator trabalha apenas com o array de 64 casas
        this.validator = new MoveValidator(this.board.board);

        // IA trabalha com board e validator
        this.ai = new AI(this.board, this.validator);

        // Define turno inicial
        this.currentTurn = 'brancas';

        // Corrigir para:
        this.view = new View(this.board, this); // passa apenas board e controller
        
        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        const piece = this.board.board[from];

        if (!piece) {
            console.log("Nenhuma peça na posição selecionada.");
            return false;
        }

        // Confirma que é a vez da cor da peça
        if (piece.cor !== this.currentTurn) {
            console.log(`Não é a vez de ${piece.cor}`);
            return false;
        }

        // Obtém movimentos possíveis usando MoveValidator
        let possibleMoves = this.validator.getPossibleMoves(from);

        // Filtra movimentos que deixam o rei em xeque
        possibleMoves = possibleMoves.filter(dest => {
            const snapshot = this.board.board.slice();
            snapshot[dest] = snapshot[from];
            snapshot[from] = null;

            // Move temporário para simular a jogada
            const tempValidator = new MoveValidator(snapshot);
            return !tempValidator.isKingInCheck(piece.cor);
        });

        if (!possibleMoves.includes(to)) {
            console.log(`Movimento inválido: ${from} -> ${to}`);
            return false;
        }

        // Executa movimento
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // Renderiza o tabuleiro
        this.view.render();

        // Alterna turno
        this.currentTurn = this.currentTurn === 'brancas' ? 'pretas' : 'brancas';

        // Verifica xeque ou xeque-mate
        if (this.validator.isKingInCheck(this.currentTurn)) {
            console.log(`Xeque para ${this.currentTurn}!`);
            if (this.validator.isCheckmate(this.currentTurn)) {
                console.log(`Xeque-mate! ${piece.cor} venceu!`);
            }
        }

        // Se for turno da IA, aciona após pequeno delay
        if (this.currentTurn === 'pretas') {
            setTimeout(() => {
                this.ai.makeMove('pretas');
                this.view.render();
                this.currentTurn = 'brancas';

                // Verifica xeque após jogada da IA
                if (this.validator.isKingInCheck(this.currentTurn)) {
                    console.log(`Xeque para ${this.currentTurn}!`);
                    if (this.validator.isCheckmate(this.currentTurn)) {
                        console.log(`Xeque-mate! Pretas venceram!`);
                    }
                }
            }, 300);
        }

        return true;
    }
}

console.log("GameController carregado!");
