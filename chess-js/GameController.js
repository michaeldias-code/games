// GameController.js
import { Modules } from './config.js';
import { Board } from './Board.js';
import { Piece } from './Piece.js';

export class GameController {
    constructor() {
        this.board = new Board();
        this.turn = 'brancas';
        this.history = [];
    }

    move(from, to) {
        const piece = this.board.getPiece(from);
        if (!piece) return false;

        const possibleMoves = this.board.getPossibleMoves(from);
        if (!possibleMoves.includes(to)) return false;

        const captured = this.board.getPiece(to);
        this.board.setPiece(to, piece);
        this.board.setPiece(from, null);

        this.history.push({from, to, piece, captured});
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';

        return true;
    }

    undo() {
        if (this.history.length === 0) return;
        const last = this.history.pop();
        this.board.setPiece(last.from, last.piece);
        this.board.setPiece(last.to, last.captured);
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';
    }

    isCheck(color) {
        return this.board.isKingInCheck(color);
    }

    isCheckmate(color) {
        return this.board.isCheckmate(color);
    }
}

console.log('GameController carregado!');
