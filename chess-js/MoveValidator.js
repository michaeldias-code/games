// MoveValidator.js — v1
export class MoveValidator {

    constructor(boardArray) {
        this.board = boardArray;
        console.log("MoveValidator carregado!");
    }

    // ---------------------------------------
    // Regras básicas
    // ---------------------------------------
    isValidPosition(pos) {
        return pos >= 0 && pos < 64;
    }

    row(pos) { return Math.floor(pos / 8); }
    col(pos) { return pos % 8; }

    sameRow(a, b) { return this.row(a) === this.row(b); }
    sameCol(a, b) { return this.col(a) === this.col(b); }

    // ---------------------------------------
    // CHECA SE MOVIMENTO DESLIZANTE QUEBRA BORDAS
    // ---------------------------------------
    slidingStepOk(start, next, offset) {
        const sr = this.row(start);
        const sc = this.col(start);
        const nr = this.row(next);
        const nc = this.col(next);

        switch (offset) {
            case -1: return nr === sr && nc === sc - 1;
            case 1: return nr === sr && nc === sc + 1;

            case -8: return nc === sc && nr === sr - 1;
            case 8: return nc === sc && nr === sr + 1;

            case -9: return (nr === sr - 1) && (nc === sc - 1);
            case -7: return (nr === sr - 1) && (nc === sc + 1);
            case 7: return (nr === sr + 1) && (nc === sc - 1);
            case 9: return (nr === sr + 1) && (nc === sc + 1);

            default: return false;
        }
    }

    // ---------------------------------------
    // MOVIMENTOS DESLIZANTES
    // ---------------------------------------
    getSlidingMoves(pos, directions) {
        const moves = [];
        const piece = this.board[pos];

        for (let d of directions) {
            let p = pos + d;

            while (this.isValidPosition(p) && this.slidingStepOk(p - d, p, d)) {

                const target = this.board[p];

                if (!target) {
                    moves.push(p);
                } else {
                    if (target.cor !== piece.cor) moves.push(p);
                    break;
                }

                p += d;
            }
        }

        return moves;
    }

    // ---------------------------------------
    // MOVIMENTOS DE UMA PEÇA (SEM FILTRO DE XEQUE)
    // ---------------------------------------
    rawMoves(pos) {
        const piece = this.board[pos];
        if (!piece) return [];

        const moves = [];
        const r = this.row(pos);
        const c = this.col(pos);

        const add = (to) => {
            if (!this.isValidPosition(to)) return;
            const tgt = this.board[to];
            if (!tgt || tgt.cor !== piece.cor) moves.push(to);
        };

        switch (piece.tipo) {
            case "♙": // peão branco
                if (r > 0 && !this.board[pos - 8]) add(pos - 8);
                if (r === 6 && !this.board[pos - 8] && !this.board[pos - 16]) add(pos - 16);
                if (c > 0 && this.board[pos - 9] && this.board[pos - 9].cor === "pretas") add(pos - 9);
                if (c < 7 && this.board[pos - 7] && this.board[pos - 7].cor === "pretas") add(pos - 7);
                break;

            case "♟": // peão preto
                if (r < 7 && !this.board[pos + 8]) add(pos + 8);
                if (r === 1 && !this.board[pos + 8] && !this.board[pos + 16]) add(pos + 16);
                if (c < 7 && this.board[pos + 9] && this.board[pos + 9].cor === "brancas") add(pos + 9);
                if (c > 0 && this.board[pos + 7] && this.board[pos + 7].cor === "brancas") add(pos + 7);
                break;

            case "♖": case "♜":
                moves.push(...this.getSlidingMoves(pos, [-1,1,-8,8]));
                break;

            case "♗": case "♝":
                moves.push(...this.getSlidingMoves(pos, [-9,-7,7,9]));
                break;

            case "♕": case "♛":
                moves.push(...this.getSlidingMoves(pos, [-1,1,-8,8,-9,-7,7,9]));
                break;

            case "♘": case "♞":
                const k = [-17,-15,-10,-6,6,10,15,17];
                for (let off of k) {
                    let to = pos + off;
                    if (!this.isValidPosition(to)) continue;
                    if (Math.abs(this.row(to) - r) + Math.abs(this.col(to) - c) === 3) {
                        const tgt = this.board[to];
                        if (!tgt || tgt.cor !== piece.cor) moves.push(to);
                    }
                }
                break;

            case "♔": case "♚":
                const ko = [-9,-8,-7,-1,1,7,8,9];
                for (let off of ko) {
                    let to = pos + off;
                    if (!this.isValidPosition(to)) continue;

                    if (Math.abs(this.row(to) - r) <= 1 &&
                        Math.abs(this.col(to) - c) <= 1) {
                        const tgt = this.board[to];
                        if (!tgt || tgt.cor !== piece.cor) moves.push(to);
                    }
                }
                break;
        }

        return moves;
    }

    // ---------------------------------------
    // FILTRO DE CHEQUE
    // ---------------------------------------
    getPossibleMoves(pos) {
        const moves = this.rawMoves(pos);
        const res = [];

        for (let to of moves) {
            if (this.wouldNotLeaveKingInCheck(pos, to)) {
                res.push(to);
            }
        }
        return res;
    }

    // Movimento temporário seguro
    wouldNotLeaveKingInCheck(from, to) {
        const piece = this.board[from];
        const backupFrom = piece;
        const backupTo = this.board[to];

        // aplica
        this.board[to] = piece;
        this.board[from] = null;

        const safe = !this.isKingInCheck(piece.cor);

        // desfaz
        this.board[from] = backupFrom;
        this.board[to] = backupTo;

        return safe;
    }

    // ---------------------------------------
    // CHEQUE
    // ---------------------------------------
    isKingInCheck(color) {
        const kingPos = this.board.findIndex(p =>
            p && (
                (p.tipo === "♔" && p.cor === color) ||
                (p.tipo === "♚" && p.cor === color)
            )
        );

        if (kingPos === -1) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (!p || p.cor === color) continue;

            const moves = this.rawMoves(i);
            if (moves.includes(kingPos))
                return true;
        }

        return false;
    }

    // ---------------------------------------
    // CHEQUE-MATE
    // ---------------------------------------
    isCheckmate(color) {
        if (!this.isKingInCheck(color)) return false;

        for (let i = 0; i < 64; i++) {
            const p = this.board[i];
            if (p && p.cor === color) {
                const moves = this.getPossibleMoves(i);
                if (moves.length > 0) return false;
            }
        }

        return true;
    }
}
