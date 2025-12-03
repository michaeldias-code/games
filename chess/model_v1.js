// =======================================================
//                   MODEL DO XADREZ
//     Com Check, Checkmate e IA que sai de Check
// =======================================================

class ModelChess {

    constructor() {
        this.reset();

        this.qTable = JSON.parse(localStorage.getItem("chessQTable") || "{}");
        this.learningRate = 0.2;
        this.discount = 0.9;
        this.explorationRate = 0.3;
    }

    // ---------------------------------------------------
    // INICIALIZAÇÃO DO TABULEIRO
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
        this.status = "Em jogo";
        this.selected = null;
    }

    getState() {
        return {
            board: this.board,
            turn: this.turn,
            status: this.status,
            selected: this.selected
        };
    }

    // ---------------------------------------------------
    // VERIFICAÇÕES DE PEÇAS
    isWhite(piece) {
        if (!piece) return null;
        return "♙♖♘♗♕♔".includes(piece);
    }

    // ---------------------------------------------------
    // MOVIMENTOS LEGAIS POR PEÇA
    isValidMove(from, to) {
        const piece = this.board[from];
        const target = this.board[to];
        if (!piece) return false;

        // Não pode capturar peça da mesma cor
        if (target && this.isWhite(piece) === this.isWhite(target)) return false;

        const rowF = Math.floor(from / 8);
        const colF = from % 8;
        const rowT = Math.floor(to / 8);
        const colT = to % 8;
        const dRow = rowT - rowF;
        const dCol = colT - colF;

        switch (piece) {
            case "♙": return this.pawnMove(dRow, dCol, from, to, true);
            case "♟": return this.pawnMove(dRow, dCol, from, to, false);
            case "♖": case "♜": return this.straightMove(from, to);
            case "♗": case "♝": return this.diagonalMove(from, to);
            case "♕": case "♛": return this.straightMove(from, to) || this.diagonalMove(from, to);
            case "♘": case "♞": return this.knightMove(dRow, dCol);
            case "♔": case "♚": return this.kingMove(dRow, dCol);
        }

        return false;
    }

    pawnMove(dRow, dCol, from, to, isWhite) {
        const dir = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;

        const target = this.board[to];

        // mover para frente
        if (dCol === 0) {
            if (dRow === dir && !target) return true;
            if (dRow === 2 * dir && Math.floor(from / 8) === startRow && !target && !this.board[from + dir * 8])
                return true;
        }

        // captura diagonal
        if (Math.abs(dCol) === 1 && dRow === dir && target && this.isWhite(target) !== isWhite)
            return true;

        return false;
    }

    straightMove(from, to) {
        const rowF = Math.floor(from / 8), colF = from % 8;
        const rowT = Math.floor(to / 8), colT = to % 8;

        if (rowF !== rowT && colF !== colT) return false;

        const dRow = rowT === rowF ? 0 : Math.sign(rowT - rowF);
        const dCol = colT === colF ? 0 : Math.sign(colT - colF);

        let r = rowF + dRow, c = colF + dCol;
        while (r !== rowT || c !== colT) {
            if (this.board[r * 8 + c]) return false;
            r += dRow;
            c += dCol;
        }

        return true;
    }

    diagonalMove(from, to) {
        const rowF = Math.floor(from / 8), colF = from % 8;
        const rowT = Math.floor(to / 8), colT = to % 8;

        if (Math.abs(rowT - rowF) !== Math.abs(colT - colF)) return false;

        const dRow = Math.sign(rowT - rowF);
        const dCol = Math.sign(colT - colF);

        let r = rowF + dRow, c = colF + dCol;

        while (r !== rowT || c !== colT) {
            if (this.board[r * 8 + c]) return false;
            r += dRow;
            c += dCol;
        }

        return true;
    }

    knightMove(dRow, dCol) {
        return (
            (Math.abs(dRow) === 2 && Math.abs(dCol) === 1) ||
            (Math.abs(dRow) === 1 && Math.abs(dCol) === 2)
        );
    }

    kingMove(dRow, dCol) {
        return Math.abs(dRow) <= 1 && Math.abs(dCol) <= 1;
    }

    // ---------------------------------------------------
    // MOVIMENTOS
    movePiece(from, to) {
        this.board[to] = this.board[from];
        this.board[from] = "";
        this.selected = null;
    }

    nextTurn() {
        this.turn = this.turn === "Brancas" ? "Pretas" : "Brancas";
    }

    // ---------------------------------------------------
    // CHECK + CHECKMATE
    isCheck(color = this.turn) {
        const kingSymbol = color === "Brancas" ? "♔" : "♚";
        const kingIndex = this.board.indexOf(kingSymbol);
        if (kingIndex === -1) return false;

        const enemyColor = color === "Brancas" ? "Pretas" : "Brancas";

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (!p) continue;

            const isEnemy =
                (enemyColor === "Brancas" && this.isWhite(p)) ||
                (enemyColor === "Pretas" && !this.isWhite(p));

            if (!isEnemy) continue;

            if (this.isValidMove(i, kingIndex)) return true;
        }

        return false;
    }

    isLegalMoveConsideringCheck(from, to) {
        const backup = [...this.board];

        this.board[to] = this.board[from];
        this.board[from] = "";

        const stillInCheck = this.isCheck(this.turn);

        this.board = backup;

        return !stillInCheck;
    }

    getAllPossibleMoves() {
        const moves = [];

        for (let from = 0; from < 64; from++) {
            const piece = this.board[from];
            if (!piece) continue;

            const isCurrentPlayer =
                (this.turn === "Brancas" && this.isWhite(piece)) ||
                (this.turn === "Pretas" && !this.isWhite(piece));

            if (!isCurrentPlayer) continue;

            for (let to = 0; to < 64; to++) {
                if (!this.isValidMove(from, to)) continue;

                // evita jogada que deixa o rei em check
                if (this.isLegalMoveConsideringCheck(from, to)) {
                    moves.push({ from, to });
                }
            }
        }

        return moves;
    }

    isCheckmate() {
        if (!this.isCheck()) return false;
        return this.getAllPossibleMoves().length === 0;
    }

    // ---------------------------------------------------
    // IA
    IAMove() {
        if (this.status !== "Em jogo") return;

        const moves = this.getAllPossibleMoves();
        if (!moves.length) {
            if (this.isCheck()) this.status = "Checkmate";
            return;
        }

        let move;

        // Exploração (movimento aleatório)
        if (Math.random() < this.explorationRate) {
            move = moves[Math.floor(Math.random() * moves.length)];
        } else {
            // Exploração Q-table
            let bestQ = -Infinity;
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

        this.movePiece(move.from, move.to);
        this.updateQTable(move, target);

        if (this.isCheckmate()) {
            this.status = "Checkmate";
            return;
        }

        this.nextTurn();
    }

    moveToKey(move) {
        return `${this.board.join("")}:${move.from}->${move.to}`;
    }

    updateQTable(move, target) {
        const key = this.moveToKey(move);
        const reward = target ? 1 : 0.1;

        const oldQ = this.qTable[key] || 0;
        const newQ = oldQ + this.learningRate * (reward - oldQ);
        this.qTable[key] = newQ;

        localStorage.setItem("chessQTable", JSON.stringify(this.qTable));
    }
}
