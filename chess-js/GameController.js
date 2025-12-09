// GameController.js -vGem
import { View } from './View.js?v=999';
import { AI } from './AI.js?v=999';
import { Board } from './Board.js?v=999';
import { EnPassant } from './EnPassant.js?v=999'; // <<<< CORRIGIDO AQUI: USAR { }
import { MoveValidator } from './MoveValidator.js?v=999';

export class GameController {
	constructor() {
		console.log("GameController inicializando...");

		this.board = new Board();

		//versão para test - Expor para o console
    	window.board = this.board;   // instância
    	window.Board = Board;        // classe

		// Tentar instanciar EnPassant
		try {
			if (typeof EnPassant !== 'undefined') {
				// Instanciamos o EnPassant sem passar o tabuleiro, pois ele precisa apenas do estado.
				this.enPassant = new EnPassant(); 
			} else {
				this.enPassant = null;
			}
		} catch (e) {
			this.enPassant = null;
		}
		
		// Passamos a instância EP para os módulos que precisam.
		this.validator = new MoveValidator(this.board.board, this.enPassant);
		this.ai = new AI(this.board, this.validator, this.enPassant);

		//consoleMode
		const isConsoleMode = window.location.href.includes("consolemode");
		// Adiciona classe ao body
		//INICIA ***CONSOLE MODE***
		if (isConsoleMode) {
			// Oculta o tabuleiro
			document.body.classList.add("consolemode");
		
			// Cria a caixinha de console web
			const consoleDiv = document.createElement('div');
			consoleDiv.style.cssText = `
				position: fixed;
				bottom: 0;
				left: 0;
				right: 0;
				height: 200px;
				background: #fff;
				border-top: 2px solid #000;
				font-family: monospace;
				padding: 8px;
				overflow-y: auto;
				display: flex;
				flex-direction: column;
				z-index: 9999;
			`;
		
			const outputDiv = document.createElement('div');
			outputDiv.style.flex = '1';
			outputDiv.style.overflowY = 'auto';
		
			const inputDiv = document.createElement('div');
			inputDiv.style.display = 'flex';
		
			const promptSpan = document.createElement('span');
			promptSpan.textContent = '>';
		
			const input = document.createElement('input');
			input.style.cssText = 'flex:1; border:none; outline:none; font-family:monospace';
		
			inputDiv.appendChild(promptSpan);
			inputDiv.appendChild(input);
			consoleDiv.appendChild(outputDiv);
			consoleDiv.appendChild(inputDiv);
			document.body.appendChild(consoleDiv);
		
			// Função para escrever no console da página
			function wlog(...args) {
				args.forEach(a => {
					const div = document.createElement('div');
					div.textContent = typeof a === 'object' ? JSON.stringify(a, null, 2) : a;
					outputDiv.appendChild(div);
				});
				outputDiv.scrollTop = outputDiv.scrollHeight;
			}
		
			// Redireciona todo console.log para wlog
			const originalLog = console.log;
			console.log = (...args) => {
				wlog(...args);       // escreve na caixinha web
				originalLog(...args); // opcional: mantém no DevTools
			};
		
			// Permite digitar comandos e ver resultados
			input.addEventListener('keydown', e => {
				if (e.key === 'Enter') {
					const cmd = input.value;
					wlog('> ' + cmd);
					try {
						const result = eval(cmd);
						if (result !== undefined) wlog(result);
					} catch(err) {
						wlog('Error: ' + err);
					}
					input.value = '';
				}
			});
		
			// Expor board e wlog para a página
			window.board = this.board;
			window.wlog = wlog;
		}

		//FIM ***CONSOLE MODE***
		

		this.view = new View(this.board, this);
			
		this.currentTurn = "brancas";
		this.gameOver = false;
		this.lastMove = null;

		this.aiTimerId = null;

		this.view.setupRestartButton(() => {
			this.resetGame();
		});

		// Configura o estado inicial do EP (deve ser null)
		if (this.enPassant) {
			this.enPassant.resetTarget();
		}

		console.log("GameController carregado!");
	}

	movePiece(from, to) {
		if (this.gameOver) return false;

		const piece = this.board.board[from];
		if (!piece) return false;
		if (piece.cor !== this.currentTurn) return false;

		// 1. ZERA o alvo EP do turno anterior ANTES de checar movimentos,
		//    pois o EP só dura 1 turno.
		//if (this.enPassant) {
		//	this.enPassant.setTarget(this.board.enPassantTargetPos);
			// ZERAR AQUI EVITARIA ERROS, mas o Board precisa que a informação EP seja transferida
			// antes que o novo alvo seja calculado em movePiece().
		//}

		const validMoves = this.validator.getPossibleMoves(from);
		if (!validMoves.includes(to)) return false;

		console.log(`DEBUG validator.getPossibleMoves para ${this.indexToNotation(from)} (${from}) =>`, validMoves);
		
		// 2. Tenta detectar se o movimento é um En Passant
		let epCapturedPos = null;
		if (this.enPassant && piece.tipo in {'♙':1, '♟':1}) {
			epCapturedPos = this.enPassant.isEnPassantMove(from, to, piece);
		}

		// 3. Executa o movimento, passando a posição EP capturada se for um EP
		// O método this.board.movePiece (já alterado) é capaz de tratar o movimento EP.
		this.board.movePiece(from, to, epCapturedPos);
		
		// 4. Registra novo alvo EP se o peão moveu 2 casas (Board já faz isso em movePiece)
		// O Board armazena o novo alvo em this.board.enPassantTargetPos.

		console.log(
			`?? Jogador: ${this.indexToNotation(from)} -> ${this.indexToNotation(to)}` +
			(epCapturedPos !== null ? ' (En Passant aplicado)' : '')
		);
		
		// Detecta roque (Reis são ♔ e ♚)
		if (piece.tipo === "♔" || piece.tipo === "♚") {
			const row = piece.cor === "brancas" ? 7 : 0;
			// Roque curto
			if (to === row * 8 + 6) {
				console.log("? Roque curto!");
				// mover torre e marcar hasMoved
				this.board.movePiece(row * 8 + 7, row * 8 + 5); 
				if (this.board.board[row*8 + 5]) this.board.board[row*8 + 5].hasMoved = true;
				if (this.board.board[to]) this.board.board[to].hasMoved = true;
			}
			// Roque longo
			if (to === row * 8 + 2) {
				console.log("? Roque longo!");
				this.board.movePiece(row * 8 + 0, row * 8 + 3); 
				if (this.board.board[row*8 + 3]) this.board.board[row*8 + 3].hasMoved = true;
				if (this.board.board[to]) this.board.board[to].hasMoved = true;
			}
		}
		
		// 5. Zera o estado EP no Board para o próximo turno. 
		//    A informação EP está agora transferida para o Board (enPassantTargetPos).
		//    O Board se auto-atualiza em movePiece, mas o GameController precisa garantir 
		//    que o *próximo* MoveValidator use o estado correto.
		
		this.view.lastMove = { from, to };
		this.view.render();

		// ... (Lógica de Promoção de Peão mantida, com os símbolos corrigidos ♙/♟) ...
		if (piece.tipo === "♙" || piece.tipo === "♟") {
			if ((piece.cor === "brancas" && this.board.row(to) === 0) || (piece.cor === "pretas" && this.board.row(to) === 7)) {
				console.log(`? Promoção detectada! Peão chegou em ${this.indexToNotation(to)}`);
				this.pendingPromotionPos = to;
				this.view.showPromotionModal(piece.cor, (simbolo) => {
					this.promotePawn(this.pendingPromotionPos, simbolo);
				});
		
				return true;
			}
		}

// 6. Troca turno
this.currentTurn = this.currentTurn === "brancas" ? "pretas" : "brancas";

// ** NOVO FLUXO: Sincronizar EP para o PRÓXIMO jogador **
if (this.enPassant) {
    // 1. O alvo recém-criado no board (pelo pulo duplo) é copiado para o EnPassant.js
    this.enPassant.setTarget(this.board.enPassantTargetPos);
    
    // 2. O alvo é resetado no Board, para que um novo alvo não seja criado sem necessidade.
    this.board.enPassantTargetPos = null;
}
// FIM NOVO FLUXO

// Loga estado de check/checkmate para o próximo jogador
this.logCheckState(this.currentTurn);
		if (this.gameOver) return true;

		// Turno da IA
		if (this.currentTurn === "pretas") {
            if (this.aiTimerId) {
                clearTimeout(this.aiTimerId);
                this.aiTimerId = null;
            }

			this.aiTimerId = setTimeout(() => {
				if (this.gameOver) return;

				// A IA usará o estado EP que acabamos de definir
				const m = this.ai.makeMove("pretas");
				
				if (m) {
					// 9. Lógica de En Passant para a IA
					const movedPiece = this.board.board[m.from];
					let epCapturedPosAI = null;
					if (this.enPassant && movedPiece && movedPiece.tipo in {'♙':1, '♟':1}) {
						epCapturedPosAI = this.enPassant.isEnPassantMove(m.from, m.to, movedPiece);
					}
					
					// 10. Aplica o movimento da IA
					this.board.movePiece(m.from, m.to, epCapturedPosAI);

					this.view.lastMove = { from: m.from, to: m.to };
					this.view.render();
					this.view.highlightCell(m.to);
					console.log(
						`?? IA: ${this.indexToNotation(m.from)} -> ${this.indexToNotation(m.to)}` +
						(epCapturedPosAI !== null ? ' (En Passant aplicado pela IA)' : '')
					);

					/* ?? PROMOÇÃO DE PEÃO PELA IA */
					const moved = this.board.board[m.to];
					// Usar this.board.row(m.to) para checar a linha correta
					if (moved && moved.tipo === "♟" && this.board.row(m.to) === 7) {
						this.promotePawn(m.to, "rainha"); // Peão preto promove
					}
					if (moved && moved.tipo === "♙" && this.board.row(m.to) === 0) {
						this.promotePawn(m.to, "rainha"); // Peão branco (na promoção da IA)
					}
				}

				this.aiTimerId = null;

this.currentTurn = "brancas";

// 11. Configura alvo EP para o próximo turno da Branca
if (this.enPassant) {
    this.enPassant.setTarget(this.board.enPassantTargetPos); // CORRETO: Sincroniza o alvo da IA
}
this.board.enPassantTargetPos = null; // Limpa o estado no board (CORRETO)

this.logCheckState(this.currentTurn);
			}, 300);
		}

		return true;
	}

	indexToNotation(i) {
    	const files = "abcdefgh";
    	const file = files[i % 8];
    	const rank = 8 - Math.floor(i / 8);
    	return `${file}${rank}`;
	}

    /* ------------------------------------------------------
       ?? MÉTODO NOVO — executa a promoção após escolha do modal
    ------------------------------------------------------ */
	promotePawn(pos, escolha) {
		const piece = this.board.board[pos];
		if (!piece) return;
	
		const cor = piece.cor;
	
		const simboloParaNome = {
			"?": "rainha", "?": "rainha",
			"?": "torre",  "?": "torre",
			"?": "bispo",  "?": "bispo",
			"?": "cavalo", "?": "cavalo"
		};
		
		if (simboloParaNome[escolha]) {
			escolha = simboloParaNome[escolha];
		}
		
		// Mapa final que coloca o símbolo correto no tabuleiro de acordo com a cor
		const mapa = {
			rainha: cor === "brancas" ? "?" : "?",
			torre:  cor === "brancas" ? "?" : "?",
			bispo:  cor === "brancas" ? "?" : "?",
			cavalo: cor === "brancas" ? "?" : "?"
		};
		
		piece.tipo = mapa[escolha];

	
		console.log(
			`?? Promoção concluída em ${this.indexToNotation(pos)} para: ${escolha}`
		);
	
		this.view.hidePromotionModal();
		this.view.render();
	
		this.currentTurn = cor === "brancas" ? "pretas" : "brancas";
		// ?? Após a promoção, inicia turno da IA (se for vez das pretas)
		if (this.currentTurn === "pretas" && !this.gameOver) {
			setTimeout(() => {
				const m = this.ai.makeMove("pretas");
				if (m) {
					this.view.lastMove = { from: m.from, to: m.to };
					this.view.render();
					this.view.highlightCell(m.to);
					console.log(`?? IA: ${this.indexToNotation(m.from)} ? ${this.indexToNotation(m.to)}`);
				}
				this.currentTurn = "brancas";
			}, 300);
		}
	}
	logCheckState(cor) {
		if (this.validator.isKingInCheck(cor)) {
			console.log(`?? Check em ${cor}!`);
	
			if (this.validator.isCheckmate(cor)) {
				console.log(`?? Checkmate! ${cor === "brancas" ? "pretas" : "brancas"} venceu!`);
				this.gameOver = true;
				this.view.onGameOver({ 
					winner: cor === "brancas" ? "pretas" : "brancas",
					reason: "checkmate"
				});
			}
		}
	}
	//RESET GAME
	resetGame() {
		console.log("Reiniciando o jogo...");
	
		if (this.aiTimerId) {
			clearTimeout(this.aiTimerId);
			this.aiTimerId = null;
		}
	
		this.board = new Board();
	
		// recriar EnPassant
		this.enPassant = new EnPassant();
		this.enPassant.resetTarget();
	
		// injetar EnPassant no MoveValidator e AI
		this.validator = new MoveValidator(this.board.board, this.enPassant);
		this.ai = new AI(this.board, this.validator, this.enPassant); // Passar EP para AI
	
		this.gameOver = false;
		this.currentTurn = "brancas";
		this.lastMove = null;
	
		this.view.board = this.board;
		this.view.selected = null;
		this.view.lastMove = null;
	
		this.view.render();
		this.view.hidePromotionModal();
	
		console.log("Jogo reiniciado!");
	}
}
