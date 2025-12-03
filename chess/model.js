// =======================================================
//                   MODEL (XADREZ FINAL)
//       Movimentos legais + IA híbrida + Captura + Check
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
        this.explorationRate = 0.3;
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

    isWhite(piece) {
        if (!piece) return null;
        const whitePieces = "♙♖♘♗♕♔";
        const blackPieces = "♟♜♞♝♛♚";
        if (whitePieces.includes(piece)) return true;
        if (blackPieces.includes(piece)) return false;
        return null;
    }

    isValidMove(from, to) {
        const piece = this.board[from];
        const target = this.board[to];
        if (!piece) return false;

        // Não pode capturar própria peça
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

        // andar para frente
        if (dCol === 0) {
            if (dRow === dir && !target) return true;
            if (dRow === 2*dir && Math.floor(from/8) === startRow && !target && !this.board[from + dir*8]) return true;
        }

        // capturar diagonal
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
        this.selected = null;
    }

    nextTurn() {
        this.turn = this.turn === "Brancas" ? "Pretas" : "Brancas";
    }

    // ===================================================
    //                  CHECK E CHECKMATE
    // ===================================================
    isCheck(color) {
        const king = color === "Brancas" ? "♔" : "♚";
        const kingPos = this.board.indexOf(king);
        if (kingPos === -1) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (!p) continue;
            if (this.isWhite(p) !== (color === "Brancas")) {
                if (this.isValidMove(i, kingPos)) return true;
            }
        }
        return false;
    }

    isCheckmate(color) {
        if (!this.isCheck(color)) return false;
        const moves = this.getAllPossibleMoves(color);
        return moves.length === 0;
    }

    getAllPossibleMoves(color = this.turn) {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if ((color === "Brancas" && this.isWhite(piece)) ||
                (color === "Pretas" && !this.isWhite(piece))) {

                for (let j = 0; j < 64; j++) {
                    if (!this.isValidMove(i, j)) continue;

                    // Simula movimento e verifica se rei ficaria em check
                    const backupFrom = this.board[i];
                    const backupTo = this.board[j];
                    this.board[j] = backupFrom;
                    this.board[i] = "";
                    const inCheck = this.isCheck(color);
                    this.board[i] = backupFrom;
                    this.board[j] = backupTo;

                    if (!inCheck) moves.push({from: i, to: j});
                }
            }
        }
        return moves;
    }

    // ===================================================
    //                  IA HÍBRIDA
    // ===================================================
    IAMove() {
        if (this.status !== "Em jogo") return;

        const moves = this.getAllPossibleMoves(this.turn);
        console.log("IA jogando, turno:", this.turn, "Movimentos possíveis:", moves.length);

        if (!moves.length) return;

        let move;
        if (Math.random() < this.explorationRate) {
            move = moves[Math.floor(Math.random() * moves.length)];
        } else {
            let bestQ = -Infinity;
            move = moves[0];
            for (const m of moves) {
                const key = this.moveToKey(m);
                const q = this.qTable[key] || 0;
                if (q > bestQ) {
                    bestQ = q;
                    move = m;
                }
            }
        }

        const target = this.board[move.to];
        console.log(`IA move de ${move.from} para ${move.to} (captura: ${target || "nenhuma"})`);
        this.movePiece(move.from, move.to);
        this.updateQTable(move, target);
        this.nextTurn();

        // Atualiza status se checkmate
        if (this.isCheckmate(this.turn)) {
            this.status = `Checkmate! ${this.turn === "Brancas" ? "Pretas" : "Brancas"} venceu`;
            console.log(this.status);
        } else if (this.isCheck(this.turn)) {
            this.status = `${this.turn} em Check!`;
            console.log(this.status);
        } else {
            this.status = "Em jogo";
        }
    }

    moveToKey(move) {
        return `${this.board.join("")}:${move.from}->${move.to}`;
    }

    updateQTable(move, target) {
        const key = this.moveToKey(move);
        const reward = this.calculateReward(target);
        const oldQ = this.qTable[key] || 0;
        const newQ = oldQ + this.learningRate * (reward + this.discount * 0 - oldQ);
        this.qTable[key] = newQ;
        localStorage.setItem("chessQTable", JSON.stringify(this.qTable));
    }

    calculateReward(target) {
        if (!target) return 0.1;
        return 1;
    }
}
