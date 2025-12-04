// AI.js
import { Board } from './Board.js';

export class AI {
    constructor(board) {
        this.board = board;
        console.log('AI carregado!');
    }

    getRandomMove(color) {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = this.board.board[i];
            if (piece && piece.cor === color) {
                const possible = this.board.getPossibleMoves(i);
                possible.forEach(m => moves.push({from: i, to: m}));
            }
        }
        if (moves.length === 0) return null;
        return moves[Math.floor(Math.random() * moves.length)];
    }

    makeMove(color) {
        const move = this.getRandomMove(color);
        if (move) this.board.movePiece(move.from, move.to);
    }
}
