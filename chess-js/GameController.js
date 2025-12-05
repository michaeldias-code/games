// GameController.js
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

        // View recebe board, ai e controller
        this.view = new View(this.board, this); // passando apenas board e controller

        // Define turno inicial
        this.currentTurn = 'brancas';

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        const piece = this.board.board[from];

        // Verifica se a peça existe na posição de origem
        if (!piece) {
            console.log("Nenhuma peça na posição selecionada.");
            return false;
        }

        // Confirma que é a vez da cor da peça
        if (piece.cor !== this.currentTurn) {
            console.log(`Não é a vez de ${piece.cor}`);
            return false;
        }

        // Obtém os movimentos possíveis utilizando o MoveValidator
        let possibleMoves = this.validator.getPossibleMoves(from);

        // Verifica se o movimento desejado está entre os possíveis
        if (!possibleMoves.includes(to)) {
            console.log(`Movimento inválido: ${from} -> ${to}`);
            return false;
        }

        // Executa o movimento
        this.board.board[to] = piece;
        this.board.board[from] = null;

        // Renderiza o tabuleiro após o movimento
        this.view.render();

        // Alterna o turno entre brancas e pretas
        this.currentTurn = this.currentTurn === 'brancas' ? 'pretas' : 'brancas';

        // Verifica se o rei do jogador que acabou de jogar está em xeque ou xeque-mate
        if (this.validator.isKingInCheck(this.currentTurn)) {
            console.log(`Xeque para ${this.currentTurn}!`);
            if (this.validator.isCheckmate(this.currentTurn)) {
                console.log(`Xeque-mate! ${piece.cor} venceu!`);
            }
        }

        // Se for a vez das pretas, aciona a IA para jogar após um pequeno atraso
        if (this.currentTurn === 'pretas') {
            setTimeout(() => {
                this.ai.makeMove('pretas');
                this.view.render(); // Renderiza novamente após o movimento da IA
                this.currentTurn = 'brancas'; // Alterna para as brancas

                // Verifica xeque após o movimento da IA
                if (this.validator.isKingInCheck(this.currentTurn)) {
                    console.log(`Xeque para ${this.currentTurn}!`);
                    if (this.validator.isCheckmate(this.currentTurn)) {
                        console.log(`Xeque-mate! Pretas venceram!`);
                    }
                }
            }, 300); // Atraso de 300ms para a IA jogar
        }

        return true; // Movimento válido
    }
}

console.log("GameController carregado!");
