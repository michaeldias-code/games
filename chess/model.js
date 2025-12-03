// =======================================================
//                    MODEL CHESS
// =======================================================

class ModelChess {
    constructor() {
        this.reset();
        this.qTable = JSON.parse(localStorage.getItem("chessQTable") || "{}");
        this.learningRate = 0.2;
        this.discount = 0.9;
        this.explorationRate = 0.3;
        this.lastIAMove = null; // para evitar volta inútil
    }

    reset() {
        this.board = [
            "♜","♞","♝","♛","♚","♝","♞","♜",
            "♟","♟","♟","♟","♟","♟","♟","♟",
            "","","","","","","","",
            "","","","","","","","",
            "","","","","","","","",
            "","","","","","","","",
            "♙","♙","♙","♙","♙","♙","♙","♙",
            "♖","♘","♗","♕","♔","♗","♘","♖"
        ];
        this.turn = "Brancas";
        this.selected = null;
        this.status = "Em jogo";
        this.lastIAMove = null;
        console.log("Jogo reiniciado");
    }

    getState() {
        return {
            board: this.board,
            turn: this.turn,
            selected: this.selected,
            status: this.status
        };
    }

    isWhite(piece) {
        if (!piece) return null;
        const whitePieces = "♙♖♘♗♕♔";
        const blackPieces = "♟♜♞♝♛♚";
        if (whitePieces.includes(piece)) return true;
        if (blackPieces.includes(piece)) return false;
        return null;
    }

    movePiece(from, to) {
        const target = this.board[to];
        console.log(`Movendo ${this.board[from]} de ${from} para ${to} (captura: ${target || "nenhuma"})`);
        this.board[to] = this.board[from];
        this.board[from] = "";
        this.selected = null;
    }

    nextTurn() {
        this.turn = this.turn === "Brancas" ? "Pretas" : "Brancas";
        console.log(`Turno agora: ${this.turn}`);
    }

    isValidMove(from, to) {
        const piece = this.board[from];
        const target = this.board[to];
        if (!piece) return false;
        if (target && this.isWhite(piece) === this.isWhite(target)) return false;

        const rowF = Math.floor(from / 8), colF = from % 8;
        const rowT = Math.floor(to / 8), colT = to % 8;
        const dRow = rowT - rowF;
        const dCol = colT - colF;

        switch (piece) {
            case "♙": return this.pawnMove(dRow, dCol, from, to, true);
            case "♟": return this.pawnMove(dRow, dCol, from, to, false);
            case "♖": case "♜": return this.straightMove(from, to);
            case "♗": case "♝": return this.diagonalMove(from, to);
            case "♕": case "♛": return this.straightMove(from,to) || this.diagonalMove(from,to);
            case "♘": case "♞": return this.knightMove(dRow, dCol);
            case "♔": case "♚": return this.kingMove(dRow, dCol);
        }
        return false;
    }

    pawnMove(dRow, dCol, from, to, isWhite) {
        const dir = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        const target = this.board[to];

        if (dCol === 0) {
            if (dRow === dir && !target) return true;
            if (dRow === 2*dir && Math.floor(from/8) === startRow && !target && !this.board[from + dir*8]) return true;
        }
        if (Math.abs(dCol) === 1 && dRow === dir && target && this.isWhite(target) !== isWhite) return true;

        return false;
    }

    straightMove(from, to) {
        const rowF = Math.floor(from / 8), colF = from % 8;
        const rowT = Math.floor(to / 8), colT = to % 8;

        if (rowF !== rowT && colF !== colT) return false;

        const dRow = rowT - rowF ? Math.sign(rowT - rowF) : 0;
        const dCol = colT - colF ? Math.sign(colT - colF) : 0;
        let r = rowF + dRow, c = colF + dCol;

        while (r !== rowT || c !== colT) {
            if (this.board[r*8 + c]) return false;
            r += dRow; c += dCol;
        }
        return true;
    }

    diagonalMove(from, to) {
        const rowF = Math.floor(from / 8), colF = from % 8;
        const rowT = Math.floor(to / 8), colT = to % 8;
        if (Math.abs(rowT-rowF) !== Math.abs(colT-colF)) return false;

        const dRow = Math.sign(rowT - rowF);
        const dCol = Math.sign(colT - colF);
        let r = rowF + dRow, c = colF + dCol;

        while (r !== rowT && c !== colT) {
            if (this.board[r*8 + c]) return false;
            r += dRow; c += dCol;
        }
        return true;
    }

    knightMove(dRow, dCol) {
        return (Math.abs(dRow) === 2 && Math.abs(dCol) === 1) ||
               (Math.abs(dRow) === 1 && Math.abs(dCol) === 2);
    }

    kingMove(dRow, dCol) {
        return Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1;
    }

    getAllPossibleMoves() {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if ((this.turn === "Brancas" && this.isWhite(piece)) || (this.turn === "Pretas" && !this.isWhite(piece))) {
                for (let j = 0; j < 64; j++) {
                    if (this.isValidMove(i,j)) {
                        // evita voltar último movimento inútil
                        if (this.lastIAMove &&
                            this.lastIAMove.from === j &&
                            this.lastIAMove.to === i) continue;
                        moves.push({from: i, to: j});
                    }
                }
            }
        }
        console.log(`Movimentos possíveis para ${this.turn}:`, moves);
        return moves;
    }

    isCheck(color) {
        const kingIndex = this.board.findIndex(p => (color==="Brancas"?p==="♔":p==="♚"));
        const opponent = color === "Brancas" ? "Pretas" : "Brancas";
        const tempTurn = this.turn;
        this.turn = opponent;
        const moves = this.getAllPossibleMoves();
        this.turn = tempTurn;
        return moves.some(m => m.to === kingIndex);
    }

    isCheckmate(color) {
        if (!this.isCheck(color)) return false;
        const tempTurn = this.turn;
        this.turn = color;
        const moves = this.getAllPossibleMoves();
        this.turn = tempTurn;
        return moves.length === 0;
    }

    // IA híbrida
    IAMove() {
        if (this.status !== "Em jogo") return;
        const moves = this.getAllPossibleMoves();
        if (!moves.length) return;

        let bestScore = -Infinity;
        let bestMove = moves[0];

        for (const move of moves) {
            const captured = this.board[move.to];
            this.movePiece(move.from, move.to);

            // score simples: captura + proteção
            let score = 0;
            if (captured) score += this.getPieceValue(captured);
            if (this.isCheck(this.turn)) score -= 5; // não se colocar em check

            // desfaz movimento
            this.board[move.from] = this.board[move.to];
            this.board[move.to] = captured;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

            console.log(`Movimento ${this.board[move.from] || "?"} de ${move.from} para ${move.to}, score = ${score}`);
        }

        // executa melhor movimento
        const captured = this.board[bestMove.to];
        this.movePiece(bestMove.from, bestMove.to);
        this.lastIAMove = bestMove; // registra último movimento
        this.nextTurn();

        if (this.isCheckmate(this.turn)) {
            this.status = `${this.turn} em checkmate`;
            console.log("Checkmate! Fim de jogo.");
        }
    }

    getPieceValue(piece) {
        switch(piece) {
            case "♟": case "♙": return 1;
            case "♞": case "♘": return 3;
            case "♝": case "♗": return 3;
            case "♜": case "♖": return 5;
            case "♛": case "♕": return 9;
            case "♚": case "♔": return 1000;
        }
        return 0;
    }
}
