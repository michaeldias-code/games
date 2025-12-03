// =======================================================
//                   MODEL (XADREZ FINAL)
//      Movimentos legais + Check + Checkmate + IA heurística
// =======================================================

class ModelChess {
    constructor() {
        this.board = [];
        this.reset();

        this.turn = "Brancas";
        this.selected = null;
        this.status = "Em jogo";

        this.qTable = JSON.parse(localStorage.getItem("chessQTable") || "{}");
        this.learningRate = 0.2;
        this.discount = 0.9;

        this.lastAIMove = null;
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
    }

    getState() {
        return {
            board: this.board,
            turn: this.turn,
            selected: this.selected,
            status: this.status
        };
    }

    // =======================================================
    //                      PEÇAS
    // =======================================================

    isWhite(piece) {
        if (!piece) return null;
        const white = "♙♖♘♗♕♔";
        const black = "♟♜♞♝♛♚";
        if (white.includes(piece)) return true;
        if (black.includes(piece)) return false;
        return null;
    }

    pieceValue(piece) {
        if (!piece) return 0;
        switch (piece) {
            case "♙": case "♟": return 1;
            case "♘": case "♞": return 3;
            case "♗": case "♝": return 3;
            case "♖": case "♜": return 5;
            case "♕": case "♛": return 9;
            case "♔": case "♚": return 100;
        }
        return 0;
    }

    // =======================================================
    //                   MOVIMENTOS
    // =======================================================

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

    movePiece(from, to) {
        this.board[to] = this.board[from];
        this.board[from] = "";

        // PROMOÇÃO automática
        if (this.board[to] === "♟" && to >= 56) this.board[to] = "♛";
        if (this.board[to] === "♙" && to <= 7)  this.board[to] = "♕";

        this.selected = null;
    }

    nextTurn() {
        this.turn = this.turn === "Brancas" ? "Pretas" : "Brancas";
    }

    // =======================================================
    //                 CHECK E CHECKMATE
    // =======================================================

    findKing(color) {
        const white = color === "Brancas";
        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (!p) continue;
            if (this.isWhite(p) === white && (p === "♔" || p === "♚")) return i;
        }
        return -1;
    }

    isSquareAttacked(square, attackingColor) {
        const enemyIsWhite = attackingColor === "Brancas";

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (!p) continue;
            if (this.isWhite(p) !== enemyIsWhite) continue;

            if (this.isValidMove(i, square)) return true;
        }

        return false;
    }

    isCheck(color = this.turn) {
        const kingPos = this.findKing(color);
        const enemyColor = color === "Brancas" ? "Pretas" : "Brancas";
        return this.isSquareAttacked(kingPos, enemyColor);
    }

    isCheckmate(color = this.turn) {
        if (!this.isCheck(color)) return false;

        const moves = this.getAllPossibleMoves(color);
        for (const mv of moves) {
            const backup = [...this.board];
            this.board[mv.to] = this.board[mv.from];
            this.board[mv.from] = "";

            const check = this.isCheck(color);

            this.board = backup;

            if (!check) return false;
        }

        return true;
    }

    // =======================================================
    //          LISTA TODAS AS JOGADAS POSSÍVEIS
    // =======================================================

    getAllPossibleMoves(color = this.turn) {
        const moves = [];
        const wantWhite = color === "Brancas";

        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if (this.isWhite(piece) !== wantWhite) continue;

            for (let j = 0; j < 64; j++) {
                if (this.isValidMove(i, j)) {
                    moves.push({from: i, to: j});
                }
            }
        }
        return moves;
    }

    // =======================================================
    //                     IA HEURÍSTICA
    // =======================================================

    IAMove() {
        if (this.status !== "Em jogo") return;

        const moves = this.getAllPossibleMoves(this.turn);
        if (!moves.length) {
            if (this.isCheck()) this.status = "Checkmate";
            return;
        }

        const enemyColor = this.turn === "Brancas" ? "Pretas" : "Brancas";

        let bestMove = null;
        let bestScore = -Infinity;

        for (const mv of moves) {
            const from = mv.from;
            const to = mv.to;

            const piece = this.board[from];
            const target = this.board[to];

            const backup = [...this.board];
            this.board[to] = piece;
            this.board[from] = "";

            let score = 0;

            // Captura
            if (target) score += this.pieceValue(target) * 10;

            // Promoção
            if (piece === "♟" && to >= 56) score += 80;
            if (piece === "♙" && to <= 7)  score += 80;

            // Evitar movimento reverso
            if (this.lastAIMove &&
                this.lastAIMove.from === to &&
                this.lastAIMove.to === from) {
                score -= 25;
            }

            // Evitar casa atacada
            if (this.isSquareAttacked(to, enemyColor)) {
                score -= this.pieceValue(piece) * 10;
            }

            // Evitar continuar em cheque
            if (this.isCheck(this.turn)) score -= 50;

            this.board = backup;

            if (score > bestScore) {
                bestScore = score;
                bestMove = mv;
            }
        }

        if (bestMove) {
            this.lastAIMove = bestMove;

            const target = this.board[bestMove.to];
            this.movePiece(bestMove.from, bestMove.to);
            this.updateQTable(bestMove, target);

            if (this.isCheckmate()) {
                this.status = "Checkmate";
                return;
            }

            this.nextTurn();
        }
    }

    // =======================================================
    //                     Q-LEARNING
    // =======================================================

    moveToKey(move) {
        return `${this.board.join("")}:${move.from}->${move.to}`;
    }

    updateQTable(move, target) {
        const key = this.moveToKey(move);
        const reward = this.calculateReward(target);
        const oldQ = this.qTable[key] || 0;

        const newQ = oldQ + this.learningRate * (reward - oldQ);
        this.qTable[key] = newQ;

        localStorage.setItem("chessQTable", JSON.stringify(this.qTable));
    }

    calculateReward(target) {
        if (!target) return 0.1;
        return this.pieceValue(target);
    }
}
