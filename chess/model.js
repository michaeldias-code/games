// =======================================================
//                   MODEL XADREZ COM LOGS
// =======================================================
class ModelChess {
    constructor() {
        this.reset();

        this.turn = "Brancas";
        this.selected = null;
        this.status = "Em jogo";

        this.qTable = JSON.parse(localStorage.getItem("chessQTable") || "{}");
        this.learningRate = 0.2;
        this.discount = 0.9;
        this.explorationRate = 0.3;

        // Valores das peças
        this.pieceValues = { 
            "♙": 1, "♟": 1, 
            "♘": 3, "♞": 3, 
            "♗": 3, "♝": 3, 
            "♖": 5, "♜": 5, 
            "♕": 9, "♛": 9, 
            "♔": 1000, "♚": 1000 
        };
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

    isValidMove(from, to) {
        const piece = this.board[from];
        const target = this.board[to];
        if (!piece) return false;
        if (target && this.isWhite(piece) === this.isWhite(target)) return false;

        const rowF = Math.floor(from / 8), colF = from % 8;
        const rowT = Math.floor(to / 8), colT = to % 8;
        const dRow = rowT - rowF, dCol = colT - colF;

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
        console.log(`Movendo ${this.board[from]} de ${from} para ${to} (captura: ${this.board[to] || 'nenhuma'})`);
        this.board[to] = this.board[from];
        this.board[from] = "";
        this.selected = null;
    }

    nextTurn() {
        this.turn = this.turn === "Brancas" ? "Pretas" : "Brancas";
        console.log("Turno agora:", this.turn);
    }

    pieceValue(piece) {
        return this.pieceValues[piece] || 0;
    }

    // Verifica check
    isCheck(whiteTurn) {
        const king = whiteTurn ? "♔" : "♚";
        const kingPos = this.board.indexOf(king);
        if (kingPos === -1) return false;

        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if (whiteTurn ? !this.isWhite(piece) : this.isWhite(piece)) {
                if (this.isValidMove(i, kingPos)) {
                    console.log(`Rei está em check! Atacado por ${piece} em ${i}`);
                    return true;
                }
            }
        }
        return false;
    }

    // Verifica checkmate
    isCheckmate() {
        const moves = this.getAllPossibleMoves(this.turn);
        const checkmate = moves.length === 0 && this.isCheck(this.turn === "Brancas");
        console.log("Verificando checkmate:", checkmate);
        return checkmate;
    }

    // Retorna todos os movimentos possíveis válidos
    getAllPossibleMoves(turn = this.turn) {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if ((turn === "Brancas" && this.isWhite(piece)) || (turn === "Pretas" && !this.isWhite(piece))) {
                for (let j = 0; j < 64; j++) {
                    if (this.isValidMove(i, j)) {
                        // Simula movimento para garantir que não deixa rei em check
                        const backupFrom = this.board[i];
                        const backupTo = this.board[j];
                        this.board[j] = backupFrom;
                        this.board[i] = "";
                        const stillSafe = !this.isCheck(turn === "Brancas");
                        this.board[i] = backupFrom;
                        this.board[j] = backupTo;

                        if (stillSafe) moves.push({from: i, to: j});
                    }
                }
            }
        }
        console.log(`Movimentos possíveis para ${turn}:`, moves);
        return moves;
    }

    // IA joga
    IAMove() {
        if (this.status !== "Em jogo") {
            console.log("IA não joga: status =", this.status);
            return;
        }

        console.log("IA jogando, turno:", this.turn);
        const moves = this.getAllPossibleMoves();
        if (!moves.length) {
            if (this.isCheck(this.turn === "Brancas")) {
                this.status = "Checkmate";
            } else {
                this.status = "Empate";
            }
            console.log("IA não encontrou movimentos. Status atualizado para:", this.status);
            return;
        }

        let bestMove = null;
        let bestScore = -Infinity;

        for (const m of moves) {
            const target = this.board[m.to];
            const fromPiece = this.board[m.from];

            // Simula jogada
            this.board[m.to] = fromPiece;
            this.board[m.from] = "";

            let score = 0;
            if (target) score += this.pieceValue(target) * 10;
            if (this.isCheck(this.turn === "Brancas")) score -= this.pieceValue(fromPiece) * 5;

            this.board[m.from] = fromPiece;
            this.board[m.to] = target;

            console.log(`Movimento ${fromPiece} de ${m.from} para ${m.to}, score = ${score}`);

            if (score > bestScore) {
                bestScore = score;
                bestMove = m;
            }
        }

        if (bestMove) {
            this.movePiece(bestMove.from, bestMove.to);
            this.nextTurn();

            if (this.isCheckmate()) {
                this.status = "Checkmate";
                console.log("Checkmate!");
            } else if (this.isCheck(this.turn === "Brancas")) {
                this.status = "Check";
                console.log("Check!");
            } else {
                this.status = "Em jogo";
            }
        }
    }
}
