import { Piece } from './Piece.js';

export class MoveValidator {
    constructor(board) {
        this.boardObj = board;      // guarda o objeto Board
        this.board = board.board;   // guarda só o array interno
    }

    sync() {
        // mantém this.board sempre igual ao board.board real
        this.board = this.boardObj.board;
    }

    isValidPosition(pos) {
        return pos >= 0 && pos < 64;
    }

    getPossibleMoves(pos) {
        this.sync();
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const addMove = (to) => {
            if (!this.isValidPosition(to)) return;
            const target = this.board[to];
            if (!target || target.cor !== piece.cor) moves.push(to);
        };

        // Peão branco
        if (piece.tipo === '♙') {
            if (this.board[pos - 8] === null) moves.push(pos - 8);
            if (Math.floor(pos / 8) === 6 && this.board[pos - 16] === null) moves.push(pos - 16);
            if (this.board[pos - 9] && this.board[pos - 9].cor === 'pretas' && pos % 8 !== 0) moves.push(pos - 9);
            if (this.board[pos - 7] && this.board[pos - 7].cor === 'pretas' && pos % 8 !== 7) moves.push(pos - 7);
        }

        // Peão preto
        else if (piece.tipo === '♟') {
            if (this.board[pos + 8] === null) moves.push(pos + 8);
            if (Math.floor(pos / 8) === 1 && this.board[pos + 16] === null) moves.push(pos + 16);
            if (this.board[pos + 9] && this.board[pos + 9].cor === 'brancas' && pos % 8 !== 7) moves.push(pos + 9);
            if (this.board[pos + 7] && this.board[pos + 7].cor === 'brancas' && pos % 8 !== 0) moves.push(pos + 7);
        }

        // Peças deslizantes
        else if (piece.isSliding()) {
            const directions = piece.getMoveOffsets();
            for (let d of directions) {
                let p = pos + d;
                while (this.isValidPosition(p) && (Math.abs((p % 8) - (pos % 8)) <= 1 || d % 8 === 0)) {
                    if (!this.board[p]) moves.push(p);
                    else {
                        if (this.board[p].cor !== piece.cor) moves.push(p);
                        break;
                    }
                    p += d;
                }
            }
        }

        // Rei ou cavalo
        else {
            const offsets = piece.getMoveOffsets();
            for (let o of offsets) addMove(pos + o);
        }

        return moves;
    }

    isKingInCheck(color) {
        this.sync();
        const kingPos = this.board.findIndex(p =>
            p && (
                (p.tipo === '♔' && p.cor === color) ||
                (p.tipo === '♚' && p.cor === color)
            )
        );
        if (kingPos === -1) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (p && p.cor !== color) {
                const moves = this.getPossibleMoves(i);
                if (moves.includes(kingPos)) return true;
            }
        }
        return false;
    }

    isCheckmate(color) {
        this.sync();
        if (!this.isKingInCheck(color)) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (p && p.cor === color) {
                const moves = this.getPossibleMoves(i);
                for (let m of moves) {
                    const snapshot = this.board.slice();

                    const target = this.board[m];
                    this.board[m] = p;
                    this.board[i] = null;

                    if (!this.isKingInCheck(color)) {
                        this.boardObj.board = snapshot;
                        this.board = this.boardObj.board;
                        return false;
                    }

                    this.boardObj.board = snapshot;
                    this.board = this.boardObj.board;
                }
            }
        }
        return true;
    }
}

console.log("MoveValidator carregado!");
