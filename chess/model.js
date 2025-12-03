// =======================================================
//                   MODEL (XADREZ COMPLETO)
//  Movimentos legais + IA inteligente + Check/Checkmate
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

        // Último movimento da IA para evitar ida-volta inútil
        this.lastIAMove = null;
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

    // ---------------------------------------------------
    // Movimentos legais por peça
    isValidMove(from, to) {
        const piece = this.board[from];
        const target = this.board[to];

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

        const dRow = rowT !== rowF ? Math.sign(rowT - rowF) : 0;
        const dCol = colT !== colF ? Math.sign(colT - colF) : 0;
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

    undoMove(from, to, captured) {
        this.board[from] = this.board[to];
        this.board[to] = captured || "";
    }

    nextTurn() {
        this.turn = this.turn === "Brancas" ? "Pretas" : "Brancas";
    }

    // ---------------------------------------------------
    // Valores das peças para avaliação
    getPieceValue(piece) {
        switch(piece) {
            case "♚": case "♔": return 1000;
            case "♛": case "♕": return 9;
            case "♜": case "♖": return 5;
            case "♝": case "♗": return 3;
            case "♞": case "♘": return 3;
            case "♟": case "♙": return 1;
            default: return 0;
        }
    }

    // ---------------------------------------------------
    // Retorna todos os movimentos possíveis do turno atual
    getAllPossibleMoves() {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if ((this.turn === "Brancas" && this.isWhite(piece)) ||
                (this.turn === "Pretas" && !this.isWhite(piece))) {
                for (let j = 0; j < 64; j++) {
                    if (this.isValidMove(i,j)) {
                        moves.push({from:i, to:j});
                    }
                }
            }
        }
        return moves;
    }

    // ---------------------------------------------------
    // Verifica check
    isCheck(color) {
        const king = color === "Brancas" ? "♔" : "♚";
        const kingIndex = this.board.indexOf(king);
        if (kingIndex === -1) return true; // rei capturado = checkmate

        const opponentMoves = this.turn === "Brancas" ? this.getOpponentMoves("Pretas") : this.getOpponentMoves("Brancas");
        return opponentMoves.some(m => m.to === kingIndex);
    }

    getOpponentMoves(color) {
        const moves = [];
        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if (!piece) continue;
            if ((color === "Brancas" && this.isWhite(piece)) ||
                (color === "Pretas" && !this.isWhite(piece))) {
                for (let j = 0; j < 64; j++) {
                    if (this.isValidMove(i,j)) moves.push({from:i,to:j});
                }
            }
        }
        return moves;
    }

    isCheckmate(color) {
        if (!this.isCheck(color)) return false;
        // se não houver nenhum movimento que tire do check → checkmate
        const moves = this.getAllPossibleMoves();
        for (const move of moves) {
            const captured = this.board[move.to];
            this.movePiece(move.from, move.to);
            const stillCheck = this.isCheck(color);
            this.undoMove(move.from, move.to, captured);
            if (!stillCheck) return false;
        }
        return true;
    }

    // ---------------------------------------------------
    // Score de cada movimento
    scoreMove(move) {
        const target = this.board[move.to];
        let score = 0;

        if (target) score += this.getPieceValue(target); // captura

        const pieceValue = this.getPieceValue(this.board[move.from]);
        this.movePiece(move.from, move.to);
        if (this.isCheck(this.turn)) score -= pieceValue; // evita self-check
        this.undoMove(move.from, move.to, target);

        // penaliza movimento de volta inútil
        if (this.lastIAMove &&
            this.lastIAMove.from === move.to &&
            this.lastIAMove.to === move.from &&
            score === 0) {
            score = -1; // desestimula voltar
        }

        return score;
    }

    // ---------------------------------------------------
    // IA híbrida com regra de evitar movimento de volta
    IAMove() {
        if (this.status !== "Em jogo") return;

        const moves = this.getAllPossibleMoves();
        if (!moves.length) return;

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of moves) {
            const score = this.scoreMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (!bestMove) return;

        const target = this.board[bestMove.to];
        this.movePiece(bestMove.from, bestMove.to);
        console.log(`IA move: ${this.board[bestMove.to]} de ${bestMove.from} para ${bestMove.to}, score=${bestScore}`);
        this.lastIAMove = {from: bestMove.from, to: bestMove.to};
        this.nextTurn();
    }
}
