// model.js
class ModelChess {
    constructor() {
        this.board = this.createBoard();
        this.turn = 'brancas';
        this.history = [];
    }

    createBoard() {
        const b = Array(64).fill(null);

        // Peões
        for (let i = 8; i < 16; i++) b[i] = {tipo: '♟', cor: 'pretas'};
        for (let i = 48; i < 56; i++) b[i] = {tipo: '♙', cor: 'brancas'};

        // Torres
        b[0] = b[7] = {tipo: '♜', cor: 'pretas'};
        b[56] = b[63] = {tipo: '♖', cor: 'brancas'};

        // Cavalos
        b[1] = b[6] = {tipo: '♞', cor: 'pretas'};
        b[57] = b[62] = {tipo: '♘', cor: 'brancas'};

        // Bispos
        b[2] = b[5] = {tipo: '♝', cor: 'pretas'};
        b[58] = b[61] = {tipo: '♗', cor: 'brancas'};

        // Rainhas
        b[3] = {tipo: '♛', cor: 'pretas'};
        b[59] = {tipo: '♕', cor: 'brancas'};

        // Reis
        b[4] = {tipo: '♚', cor: 'pretas'};
        b[60] = {tipo: '♔', cor: 'brancas'};

        return b;
    }

    movePiece(from, to) {
        const piece = this.board[from];
        if (!piece) return false;

        const target = this.board[to];
        if (target && target.cor === piece.cor) return false;

        this.history.push({from, to, piece, captured: target || null});

        this.board[to] = piece;
        this.board[from] = null;

        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';
        return true;
    }

    getPossibleMoves(pos) {
        const piece = this.board[pos];
        if (!piece || piece.cor !== this.turn) return [];

        const moves = [];
        const addMove = (to) => {
            if (to < 0 || to >= 64) return;
            const target = this.board[to];
            if (!target || target.cor !== piece.cor) moves.push(to);
        };

        switch(piece.tipo) {
            case '♙':
                if (pos - 8 >= 0 && !this.board[pos-8]) moves.push(pos-8);
                if (Math.floor(pos/8) === 6 && !this.board[pos-16]) moves.push(pos-16);
                if (pos%8 !== 0 && this.board[pos-9] && this.board[pos-9].cor === 'pretas') moves.push(pos-9);
                if (pos%8 !== 7 && this.board[pos-7] && this.board[pos-7].cor === 'pretas') moves.push(pos-7);
                break;
            case '♟':
                if (pos + 8 < 64 && !this.board[pos+8]) moves.push(pos+8);
                if (Math.floor(pos/8) === 1 && !this.board[pos+16]) moves.push(pos+16);
                if (pos%8 !== 7 && this.board[pos+9] && this.board[pos+9].cor === 'brancas') moves.push(pos+9);
                if (pos%8 !== 0 && this.board[pos+7] && this.board[pos+7].cor === 'brancas') moves.push(pos+7);
                break;
            case '♖': case '♜':
                moves.push(...this.getLinearMoves(pos, [-1,1,-8,8]));
                break;
            case '♘': case '♞':
                moves.push(...this.getKnightMoves(pos));
                break;
            case '♗': case '♝':
                moves.push(...this.getDiagonalMoves(pos, [-9,-7,7,9]));
                break;
            case '♕': case '♛':
                moves.push(...this.getQueenMoves(pos));
                break;
            case '♔': case '♚':
                moves.push(...this.getKingMoves(pos));
                break;
        }

        return moves;
    }

    getLinearMoves(pos, dirs) {
        const moves = [];
        const piece = this.board[pos];
        for (let d of dirs) {
            let p = pos + d;
            while (p >= 0 && p < 64 && this.isSameLine(pos,p,d)) {
                if (!this.board[p]) moves.push(p);
                else {
                    if (this.board[p].cor !== piece.cor) moves.push(p);
                    break;
                }
                p += d;
            }
        }
        return moves;
    }

    getDiagonalMoves(pos, dirs) {
        const moves = [];
        const piece = this.board[pos];
        for (let d of dirs) {
            let p = pos + d;
            while (p >= 0 && p < 64 && this.isDiagonal(pos,p,d)) {
                if (!this.board[p]) moves.push(p);
                else {
                    if (this.board[p].cor !== piece.cor) moves.push(p);
                    break;
                }
                p += d;
            }
        }
        return moves;
    }

    getKnightMoves(pos) {
        const moves = [];
        const piece = this.board[pos];
        const offsets = [-17,-15,-10,-6,6,10,15,17];
        for (let o of offsets) {
            const t = pos+o;
            if (t<0||t>63) continue;
            const colDiff = Math.abs((pos%8)-(t%8));
            if (colDiff>2) continue;
            if (!this.board[t] || this.board[t].cor !== piece.cor) moves.push(t);
        }
        return moves;
    }

    getQueenMoves(pos) {
        return [...this.getLinearMoves(pos,[-1,1,-8,8]), ...this.getDiagonalMoves(pos,[-9,-7,7,9])];
    }

    getKingMoves(pos) {
        const moves = [];
        const piece = this.board[pos];
        const offsets = [-9,-8,-7,-1,1,7,8,9];
        for (let o of offsets) {
            const t = pos+o;
            if (t<0||t>63) continue;
            const colDiff = Math.abs((pos%8)-(t%8));
            if (colDiff>1) continue;
            if (!this.board[t] || this.board[t].cor !== piece.cor) moves.push(t);
        }
        return moves;
    }

    isSameLine(from,to,d) {
        if (d === -1 || d === 1) return Math.floor(from/8) === Math.floor(to/8);
        return true;
    }

    isDiagonal(from,to,d) {
        const colDiff = Math.abs((from%8)-(to%8));
        return colDiff === Math.abs(d%8);
    }

    isKingInCheck(color) {
        const kingPos = this.board.findIndex(p => p && p.tipo.toLowerCase() === '♔' && p.cor === color);
        for (let i=0;i<64;i++){
            const p = this.board[i];
            if (p && p.cor !== color){
                const moves = this.getPossibleMoves(i);
                if (moves.includes(kingPos)) return true;
            }
        }
        return false;
    }

    isCheckmate(color) {
        if (!this.isKingInCheck(color)) return false;
        for (let i=0;i<64;i++){
            const p = this.board[i];
            if (p && p.cor === color){
                const moves = this.getPossibleMoves(i);
                for (let m of moves){
                    const snapshot = this.board.slice();
                    const target = this.board[m];
                    this.board[m] = p;
                    this.board[i] = null;
                    const stillInCheck = this.isKingInCheck(color);
                    this.board = snapshot;
                    if (!stillInCheck) return false;
                }
            }
        }
        return true;
    }

    undoMove() {
        if (!this.history.length) return;
        const last = this.history.pop();
        this.board[last.from] = last.piece;
        this.board[last.to] = last.captured;
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';
    }
}

console.log("ModelChess carregado com sucesso!");
