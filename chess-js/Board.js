// Board.js - v1
export class Board {
    constructor() {
        console.log("Board construído!");

        this.board = Array(64).fill(null);
        this.setupPieces();
    }

    setupPieces() {
        console.log("Board: posicionando peças...");

        // Peões pretos
        for (let i = 8; i < 16; i++)
            this.board[i] = { tipo: "♟", cor: "pretas" };

        // Peões brancos
        for (let i = 48; i < 56; i++)
            this.board[i] = { tipo: "♙", cor: "brancas" };

        // Torres
        this.board[0] = this.board[7] = { tipo: "♜", cor: "pretas" };
        this.board[56] = this.board[63] = { tipo: "♖", cor: "brancas" };

        // Cavalos
        this.board[1] = this.board[6] = { tipo: "♞", cor: "pretas" };
        this.board[57] = this.board[62] = { tipo: "♘", cor: "brancas" };

        // Bispos
        this.board[2] = this.board[5] = { tipo: "♝", cor: "pretas" };
        this.board[58] = this.board[61] = { tipo: "♗", cor: "brancas" };

        // Rainhas
        this.board[3] = { tipo: "♛", cor: "pretas" };
        this.board[59] = { tipo: "♕", cor: "brancas" };

        // Reis
        this.board[4] = { tipo: "♚", cor: "pretas" };
        this.board[60] = { tipo: "♔", cor: "brancas" };

        console.log("Board pronto!");
    }

    movePiece(from, to) {
        this.board[to] = this.board[from];
        this.board[from] = null;
    }
}
