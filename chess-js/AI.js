// AI.js
import { Board } from './Board.js';

export class AI {
    constructor(board) {
        this.board = board;
    }

    getMove(color) {
        const pieces = [];
        for (let i = 0; i < 64; i++) {
            const p = this.board.getPiece(i);
            if (p && p.cor === color) pieces.push({ pos: i, piece: p });
        }

        const moves = [];

        for (let obj of pieces) {
            const possibles = this.board.getPossibleMoves(obj.pos);
            for (let to of possibles) {
                moves.push({ from: obj.pos, to, piece: obj.piece });
            }
        }

        if (moves.length === 0) return null;

        // 1. Movimentos que capturam peças
        const captureMoves = moves.filter(m => this.board.getPiece(m.to));
        if (captureMoves.length > 0) return this.chooseBestMove(captureMoves, color);

        // 2. Movimentos que colocam o rei adversário em check
        const checkMoves = moves.filter(m => {
            const snapshot = this.board.clone();
            snapshot.setPiece(m.to, m.piece);
            snapshot.setPiece(m.from, null);
            return snapshot.isKingInCheck(color === 'brancas' ? 'pretas' : 'brancas');
        });
        if (checkMoves.length > 0) return this.chooseBestMove(checkMoves, color);

        // 3. Evitar deixar o próprio rei em check
        const safeMoves = moves.filter(m => {
            const snapshot = this.board.clone();
            snapshot.setPiece(m.to, m.piece);
            snapshot.setPiece(m.from, null);
            return !snapshot.isKingInCheck(color);
        });
        if (safeMoves.length > 0) return this.chooseBestMove(safeMoves, color);

        // 4. Fallback aleatório
        return moves[Math.floor(Math.random() * moves.length)];
    }

    chooseBestMove(moveList, color) {
        // Simples heurística: captura a peça de maior valor
        const pieceValue = { '♙': 1, '♟': 1, '♘': 3, '♞': 3, '♗': 3, '♝': 3, '♖': 5, '♜': 5, '♕': 9, '♛': 9, '♔': 1000, '♚': 1000 };
        moveList.sort((a, b) => {
            const targetA = this.board.getPiece(a.to);
            const targetB = this.board.getPiece(b.to);
            const valA = targetA ? pieceValue[targetA.tipo] : 0;
            const valB = targetB ? pieceValue[targetB.tipo] : 0;
            return valB - valA;
        });
        return moveList[0];
    }

    makeMove(color) {
        const move = this.getMove(color);
        if (!move) return false;

        const piece = this.board.getPiece(move.from);
        const captured = this.board.getPiece(move.to);

        this.board.setPiece(move.to, piece);
        this.board.setPiece(move.from, null);

        console.log(`IA (${color}) moveu ${piece.tipo} de ${move.from} para ${move.to}` +
                    (captured ? ` capturando ${captured.tipo}` : ''));

        return true;
    }
}

console.log('AI carregado com estratégia!');
