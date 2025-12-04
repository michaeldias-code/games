// Board.js
import { Classes } from './config.js';
import { Piece } from './Piece.js';
import { MoveValidator } from './MoveValidator.js';

export class Board {
    constructor() {
        this.squares = Array(64).fill(null); // Tabuleiro 8x8
        this.turn = 'brancas';
        this.history = [];
        this.validator = new MoveValidator(this.squares);
        this.initBoard();
    }

    initBoard() {
        // Peões
        for (let i = 8; i < 16; i++) this.squares[i] = new Piece('♟', 'pretas');
        for (let i = 48; i < 56; i++) this.squares[i] = new Piece('♙', 'brancas');

        // Torres
        this.squares[0] = this.squares[7] = new Piece('♜', 'pretas');
        this.squares[56] = this.squares[63] = new Piece('♖', 'brancas');

        // Cavalos
        this.squares[1] = this.squares[6] = new Piece('♞', 'pretas');
        this.squares[57] = this.squares[62] = new Piece('♘', 'brancas');

        // Bispos
        this.squares[2] = this.squares[5] = new Piece('♝', 'pretas');
        this.squares[58] = this.squares[61] = new Piece('♗', 'brancas');

        // Rainhas
        this.squares[3] = new Piece('♛', 'pretas');
        this.squares[59] = new Piece('♕', 'brancas');

        // Reis
        this.squares[4] = new Piece('♚', 'pretas');
        this.squares[60] = new Piece('♔', 'brancas');
    }

    movePiece(from, to) {
        const piece = this.squares[from];
        if (!piece) return false;

        const possibleMoves = this.validator.getPossibleMoves(from);
        if (!possibleMoves.includes(to)) return false;

        // Salva histórico
        this.history.push({ from, to, piece, captured: this.squares[to] });

        // Move
        this.squares[to] = piece;
        this.squares[from] = null;

        // Troca turno
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';

        return true;
    }

    undoMove() {
        if (!this.history.length) return;
        const last = this.history.pop();
        this.squares[last.from] = last.piece;
        this.squares[last.to] = last.captured;
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';
    }

    getState() {
        return {
            squares: this.squares,
            turn: this.turn
        };
    }
}

console.log('Board carregado!');
