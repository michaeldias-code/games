// GameController.js — v1
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

        this.view = new View(this.board, this);

        this.currentTurn = "brancas";
        this.gameOver = false;

        console.log("GameController carregado!");
    }

    movePiece(from, to) {
        if (this.gameOver) return false;

        const piece = this.board.board[from];
        if (!piece) return false;

        if (piece.cor !== this.currentTurn) return false;

        const validMoves = this.validator.getPossibleMoves(from);
        if (!validMoves.includes(to)) return false;

        // Executa o movimento
        this.board.movePiece(from, to);
        this.view.lastMove = { from, to }; // registra o movimento para destaque
        this.view.render();

        // Troca de turno
        this.currentTurn = this.currentTurn === "brancas" ? "pretas" : "brancas";

        // Verifica xeque
        const enemy = this.currentTurn;
        if (this.validator.isKingInCheck(enemy)) {
            console.log(`Xeque em ${enemy}!`);
            if (this.validator.isCheckmate(enemy)) {
                console.log(`Checkmate! ${piece.cor} venceu!`);
                this.gameOver = true;
                this.view.onGameOver({ winner: piece.cor, reason: "checkmate" });
                return true;
            }
        }

        // Turno da IA
        if (this.currentTurn === "pretas") {
            setTimeout(() => {
                const m = this.ai.makeMove("pretas"); // retorna {from, to}
                if (m) {
                    this.view.lastMove = { from: m.from, to: m.to };
                    this.view.render();
                    this.view.highlightCell(m.to); // destaque amarelo temporário
                    console.log(`IA moveu de ${m.from} para ${m.to}`);
                }

                // Verifica xeque após movimento da IA
                this.currentTurn = "brancas";
                if (this.validator.isKingInCheck("brancas")) {
                    console.log("Xeque para brancas!");
                    if (this.validator.isCheckmate("brancas")) {
                        console.log("Xeque-mate! Pretas venceram!");
                        this.gameOver = true;
                        this.view.onGameOver({ winner: "pretas", reason: "checkmate" });
                    }
                }
            }, 300); // atraso de 300ms para animação
        }

        return true;
    }
}

console.log("GameController carregado!");
