// AI.js - v1
import { MoveValidator } from "./MoveValidator.js";

export class AI {
    constructor(board, validator) {
        this.board = board;
        this.validator = validator;
        console.log("AI carregado! Validator recebido:", this.validator);
    }

    getRandomMove(color) {
        console.log("Validator dentro da IA:", this.validator);
        const moves = [];

        for (let i = 0; i < 64; i++) {
            const p = this.board.board[i];
            if (p && p.cor === color) {
                const possible = this.validator.getPossibleMoves(i);
                for (let dest of possible) moves.push({ from: i, to: dest });
            }
        }

        if (moves.length === 0) return null;

        return moves[Math.floor(Math.random() * moves.length)];
    }

    makeMove(color) {
        const m = this.getRandomMove(color);
        if (m) {
            this.board.movePiece(m.from, m.to);
            return m; // retorna para o GameController saber
        }
        return null;
    }
}


