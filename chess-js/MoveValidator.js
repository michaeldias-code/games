// MoveValidator.js
import { Classes } from './config.js';
import { Piece } from './Piece.js';

export class MoveValidator {
    constructor(board) {
        this.board = board; // Board é o array de 64 posições
    }

    isValidPosition(pos) {
        return pos >= 0 && pos < 64;
    }

    getPossibleMoves(pos) {
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const addMove = (to) => {
            if (!this.isValidPosition(to)) return;
            const target = this.board[to];
            if (!target || target.cor !== piece.cor) moves.push(to);
        };

        if (piece.tipo === '♙') { // Peão branco
            if (this.board[pos-8] === null) moves.push(pos-8);
            if (Math.floor(pos/8) === 6 && this.board[pos-16] === null) moves.push(pos-16);
            if (this.board[pos-9] && this.board[pos-9].cor === 'pretas' && pos%8 !== 0) moves.push(pos-9);
            if (this.board[pos-7] && this.board[pos-7].cor === 'pretas' && pos%8 !== 7) moves.push(pos-7);
        } else if (piece.tipo === '♟') { // Peão preto
            if (this.board[pos+8] === null) moves.push(pos+8);
            if (Math.floor(pos/8) === 1 && this.board[pos+16] === null) moves.push(pos+16);
            if (this.board[pos+9] && this.board[pos+9].cor === 'brancas' && pos%8 !== 7) moves.push(pos+9);
            if (this.board[pos+7] && this.board[pos+7].cor === 'brancas' && pos%8 !== 0) moves.push(pos+7);
        } else if (piece.isSliding()) { // Peças deslizantes
            const directions = piece.getMoveOffsets();
            for (let d of directions) {
                let p = pos + d;
                while (this.isValidPosition(p) && (Math.abs((p%8) - (pos%8)) <= 1 || d % 8 === 0)) {
                    if (!this.board[p]) moves.push(p);
                    else {
                        if (this.board[p].cor !== piece.cor) moves.push(p);
                        break;
                    }
                    p += d;
                }
            }
        } else { // Cavalo ou rei
            const offsets = piece.getMoveOffsets();
            for (let o of offsets) addMove(pos + o);
        }

        return moves;
    }

    // Verifica se o rei de uma cor está em check
    isKingInCheck(color) {
        const kingPos = this.board.findIndex(p => p && (p.tipo === '♔' && p.cor === color || p.tipo === '♚' && p.cor === color));
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

    // Verifica checkmate
    isCheckmate(color) {
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
                        this.board = snapshot;
                        return false;
                    }
                    this.board = snapshot;
                }
            }
        }
        return true;
    }
}

console.log('MoveValidator carregado!');
