// Board.js
import { Classes } from './config.js';

export class Board {
    constructor() {
        this.board = this.createBoard();
    }

    createBoard() {
        // 8x8 board representado em array de 64 posições
        const b = Array(64).fill(null);

        // Peões
        for (let i = 8; i < 16; i++) b[i] = { tipo: '♟', cor: 'pretas' };
        for (let i = 48; i < 56; i++) b[i] = { tipo: '♙', cor: 'brancas' };

        // Torres
        b[0] = b[7] = { tipo: '♜', cor: 'pretas' };
        b[56] = b[63] = { tipo: '♖', cor: 'brancas' };

        // Cavalos
        b[1] = b[6] = { tipo: '♞', cor: 'pretas' };
        b[57] = b[62] = { tipo: '♘', cor: 'brancas' };

        // Bispos
        b[2] = b[5] = { tipo: '♝', cor: 'pretas' };
        b[58] = b[61] = { tipo: '♗', cor: 'brancas' };

        // Rainhas
        b[3] = { tipo: '♛', cor: 'pretas' };
        b[59] = { tipo: '♕', cor: 'brancas' };

        // Reis
        b[4] = { tipo: '♚', cor: 'pretas' };
        b[60] = { tipo: '♔', cor: 'brancas' };

        return b;
    }

    getPiece(pos) {
        if (pos < 0 || pos >= 64) return null;
        return this.board[pos];
    }

    setPiece(pos, piece) {
        if (pos < 0 || pos >= 64) return false;
        this.board[pos] = piece;
        return true;
    }

    movePiece(from, to) {
        const piece = this.getPiece(from);
        if (!piece) return false;
        const target = this.getPiece(to);

        // Salva histórico simples (para futuras implementações de undo)
        const move = { from, to, piece, captured: target || null };

        // Executa o movimento
        this.setPiece(to, piece);
        this.setPiece(from, null);

        return move;
    }

    isEmpty(pos) {
        return this.getPiece(pos) === null;
    }

    isOpponent(pos, color) {
        const p = this.getPiece(pos);
        return p && p.cor !== color;
    }

    cloneBoard() {
        return this.board.map(p => p ? { ...p } : null);
    }
}

console.log('Board module carregado!');
