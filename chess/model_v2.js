// model.js
class ChessModel {
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
                if (this.board[pos-8] === null) moves.push(pos-8);
                if (Math.floor(pos/8) === 6 && this.board[pos-16] === null) moves.push(pos-16);
                if (this.board[pos-9] && this.board[pos-9].cor === 'pretas' && pos%8 !== 0) moves.push(pos-9);
                if (this.board[pos-7] && this.board[pos-7].cor === 'pretas' && pos%8 !== 7) moves.push(pos-7);
                break;
            case '♟':
                if (this.board[pos+8] === null) moves.push(pos+8);
                if (Math.floor(pos/8) === 1 && this.board[pos+16] === null) moves.push(pos+16);
                if (this.board[pos+9] && this.board[pos+9].cor === 'brancas' && pos%8 !== 7) moves.push(pos+9);
                if (this.board[pos+7] && this.board[pos+7].cor === 'brancas' && pos%8 !== 0) moves.push(pos+7);
                break;
            case '♖':
            case '♜':
                const directions = [-1, 1, -8, 8];
                for (let d of directions) {
                    let p = pos + d;
                    while (p >=0 && p < 64 && (Math.floor(p/8) === Math.floor(pos/8) || d % 8 === 0)) {
                        if (!this.board[p]) moves.push(p);
                        else {
                            if (this.board[p].cor !== piece.cor) moves.push(p);
                            break;
                        }
                        p += d;
                    }
                }
                break;
            case '♘':
            case '♞':
                const knightMoves = [-17,-15,-10,-6,6,10,15,17];
                for (let m of knightMoves) addMove(pos+m);
                break;
            case '♗':
            case '♝':
                const diag = [-9,-7,7,9];
                for (let d of diag) {
                    let p = pos+d;
                    while (p>=0 && p<64 && Math.abs((p%8)-(pos%8)) === Math.abs(d%8)) {
                        if (!this.board[p]) moves.push(p);
                        else {
                            if (this.board[p].cor !== piece.cor) moves.push(p);
                            break;
                        }
                        p += d;
                    }
                }
                break;
            case '♕':
            case '♛':
                moves.push(...this.getQueenMoves(pos));
                break;
            case '♔':
            case '♚':
                const kingMoves = [-9,-8,-7,-1,1,7,8,9];
                for (let k of kingMoves) addMove(pos+k);
                break;
        }
        return moves;
    }

    getQueenMoves(pos) {
        const moves = [];
        const directions = [-1,1,-8,8,-9,-7,7,9];
        for (let d of directions) {
            let p = pos+d;
            while (p>=0 && p<64 && Math.abs((p%8)-(pos%8)) <=1) {
                if (!this.board[p]) moves.push(p);
                else {
                    if (this.board[p].cor !== this.board[pos].cor) moves.push(p);
                    break;
                }
                p += d;
            }
        }
        return moves;
    }

    isKingInCheck(color) {
        const kingPos = this.board.findIndex(p => p && p.tipo.toLowerCase() === '♔' && p.cor === color);
        for (let i=0;i<64;i++){
            const p = this.board[i];
            if (p && p.cor !== color) {
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
        if (this.history.length === 0) return;
        const last = this.history.pop();
        this.board[last.from] = last.piece;
        this.board[last.to] = last.captured;
        this.turn = this.turn === 'brancas' ? 'pretas' : 'brancas';
    }

    // método adicionado para o controller
    getState() {
        return {
            board: this.board,
            turn: this.turn,
            history: this.history
        };
    }
}

console.log("ChessModel carregado com sucesso!");

