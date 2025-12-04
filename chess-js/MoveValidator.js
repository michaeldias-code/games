// MoveValidator.js
export class MoveValidator {
    constructor(boardObj) {
        this.boardObj = boardObj;
        this.board = boardObj.board;
        console.log("MoveValidator carregado!");
    }

    sync() {
        this.board = this.boardObj.board;
    }

    isValidPosition(p) {
        return p >= 0 && p < 64;
    }

    getPossibleMoves(pos) {
        this.sync();
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const add = (to) => {
            if (!this.isValidPosition(to)) return;
            const t = this.board[to];
            if (!t || t.cor !== piece.cor) moves.push(to);
        };

        // Peão branco
        if (piece.tipo === "♙") {
            if (this.board[pos - 8] === null) moves.push(pos - 8);
            if (Math.floor(pos / 8) === 6 && this.board[pos - 16] === null)
                moves.push(pos - 16);

            if (this.board[pos - 9] && pos % 8 !== 0 && this.board[pos - 9].cor === "pretas")
                moves.push(pos - 9);
            if (this.board[pos - 7] && pos % 8 !== 7 && this.board[pos - 7].cor === "pretas")
                moves.push(pos - 7);
        }

        // Peão preto
        else if (piece.tipo === "♟") {
            if (this.board[pos + 8] === null) moves.push(pos + 8);
            if (Math.floor(pos / 8) === 1 && this.board[pos + 16] === null)
                moves.push(pos + 16);

            if (this.board[pos + 9] && pos % 8 !== 7 && this.board[pos + 9].cor === "brancas")
                moves.push(pos + 9);
            if (this.board[pos + 7] && pos % 8 !== 0 && this.board[pos + 7].cor === "brancas")
                moves.push(pos + 7);
        }

        return moves;
    }
}
