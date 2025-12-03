/* ============================================================
   CONFIGURAÇÕES INICIAIS
============================================================ */
let board = [
    ["l","n","s","g","k","g","s","n","l"],
    [".","r",".",".",".",".",".","b","."],
    ["p","p","p","p","p","p","p","p","p"],
    [".",".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".",".","."],
    [".",".",".",".",".",".",".",".","."],
    ["P","P","P","P","P","P","P","P","P"],
    [".","B",".",".",".",".",".","R","."],
    ["L","N","S","G","K","G","S","N","L"]
];

let currentPlayer = "PLAYER";
let capturedPlayer = [];
let capturedAI = [];
let selectedPiece = null;
let gameOver = false;

const PLAYER = "PLAYER";
const AI = "AI";

/* ============================================================
   FUNÇÕES AUXILIARES
============================================================ */
function isPlayerPiece(p){ return p && p === p.toUpperCase(); }
function isAIPiece(p){ return p && p === p.toLowerCase(); }
function unpromote(p){ return p.toUpperCase(); }
function pieceImageFromBase(p){ return p.toUpperCase() + ".svg"; }
function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* ============================================================
   LEGAL MOVES
============================================================ */
function legalMoves(sel) {
    const moves = [];
    const r = sel.r;
    const c = sel.c;
    const p = sel.p;
    const isPlayer = isPlayerPiece(p);
    const forward = isPlayer ? -1 : 1;

    function addMove(tr, tc) {
        if (tr<0 || tr>8 || tc<0 || tc>8) return;
        const target = board[tr][tc];
        if (target==="." || (isPlayer && isAIPiece(target)) || (!isPlayer && isPlayerPiece(target))){
            moves.push({from:[r,c], to:[tr,tc], piece:p});
        }
    }

    const base = p.toUpperCase();
    switch(base){
        case "P":
            addMove(r+forward,c);
            break;
        case "L":
            for(let i=1;i<9;i++){
                let tr = r + i*forward;
                if(tr<0||tr>8) break;
                let target = board[tr][c];
                if(target===".") moves.push({from:[r,c], to:[tr,c], piece:p});
                else { if((isPlayer&&isAIPiece(target))||(!isPlayer&&isPlayerPiece(target))) moves.push({from:[r,c], to:[tr,c], piece:p}); break;}
            }
            break;
        case "N":
            let nr = r + 2*forward;
            if(nr>=0 && nr<=8){
                if(c-1>=0) addMove(nr,c-1);
                if(c+1<=8) addMove(nr,c+1);
            }
            break;
        case "S":
            [[forward,0],[forward,-1],[forward,1],[-forward,-1],[-forward,1]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
        case "G":
        case "P+": case "L+": case "N+": case "S+":
            [[forward,0],[0,-1],[0,1],[forward,-1],[forward,1],[-forward,0]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
        case "B":
            [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
                for(let i=1;i<9;i++){
                    let tr=r+dr*i, tc=c+dc*i;
                    if(tr<0||tr>8||tc<0||tc>8) break;
                    let target = board[tr][tc];
                    if(target===".") moves.push({from:[r,c], to:[tr,tc], piece:p});
                    else { if((isPlayer&&isAIPiece(target))||(!isPlayer&&isPlayerPiece(target))) moves.push({from:[r,c], to:[tr,tc], piece:p}); break;}
                }
            });
            break;
        case "R":
            [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
                for(let i=1;i<9;i++){
                    let tr=r+dr*i, tc=c+dc*i;
                    if(tr<0||tr>8||tc<0||tc>8) break;
                    let target = board[tr][tc];
                    if(target===".") moves.push({from:[r,c], to:[tr,tc], piece:p});
                    else { if((isPlayer&&isAIPiece(target))||(!isPlayer&&isPlayerPiece(target))) moves.push({from:[r,c], to:[tr,tc], piece:p}); break;}
                }
            });
            break;
        case "K":
            [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
    }
    return moves;
}

/* ============================================================
   HIGHLIGHT
============================================================ */
function highlightMoves(r, c, p) {
    clearHighlights();
    const moves = legalMoves({ r, c, p });

    let showedPromoTip = false;
    let showedCaptureTip = false;

    moves.forEach(mv => {
        const [tr, tc] = mv.to;
        const cell = document.querySelector(`.cell[data-r='${tr}'][data-c='${tc}']`);
        if (cell) cell.style.backgroundColor = "#a2f5a2";

        const target = board[tr][tc];
        const base = p.toUpperCase();

        // CAPTURA DISPONÍVEL?
        if (target !== "." && isAIPiece(target)) {
            showedCaptureTip = true;
        }

        // PROMOÇÃO DISPONÍVEL?
        if (!p.endsWith("+") && ["P","L","N","S","B","R"].includes(base)) {
            if (canPromoteHover(p, tr)) {
                showedPromoTip = true;
            }
        }
    });

    // Exibir apenas UMA mensagem
    if (showedPromoTip) {
        addLog("🔥 Promoção disponível nesta jogada!");
    } else if (showedCaptureTip) {
        addLog("⚔️ Você pode capturar uma peça!");
    }
}

function clearHighlights(){
    document.querySelectorAll(".cell").forEach(cell=>cell.style.backgroundColor="");
}

/* ============================================================
   DROPS
============================================================ */
function dropIsLegal(piece,r,c){
    if(board[r][c]!==".") return false;
    const p = piece.piece;
    if(p==="P" && columnHasPawn(PLAYER,c)) return false;
    if(p==="P"||p==="L") if(r===0) return false;
    if(p==="N") if(r<=1) return false;
    return true;
}

function makeDrop(move){
    const {piece,to} = move;
    const [r,c] = to;
    const idx = capturedPlayer.indexOf(piece);
    if(idx>=0) capturedPlayer.splice(idx,1);
    board[r][c] = piece;
    renderCaptures();
}

function columnHasPawn(side,col){
    for(let r=0;r<9;r++){
        const p = board[r][col];
        if(side===PLAYER && p==="P") return true;
        if(side===AI && p==="p") return true;
    }
    return false;
}

/* ============================================================
   PROMOÇÃO
============================================================ */
function forcePromotion(piece, r){
    const base = piece.toUpperCase();
    const isPlayer = isPlayerPiece(piece);
    if(base==="P"||base==="L") return (isPlayer && r===0)||(!isPlayer && r===8);
    if(base==="N") return (isPlayer && r<=1)||(!isPlayer && r>=7);
    return false;
}

function promotePiece(p){
    if(!p) return p;
    const upper = p.toUpperCase();
    switch(upper){
        case "P": return "P+";
        case "L": return "L+";
        case "N": return "N+";
        case "S": return "S+";
        default: return p;
    }
}

function canPromote(piece, r){
    if(!piece) return false;
    const upper = piece.toUpperCase();
    if(!["P","L","N","S"].includes(upper)) return false;
    return (currentPlayer===PLAYER && r<=2) || (currentPlayer===AI && r>=6);
}
function canPromoteHover(piece, r) {
    if (!piece) return false;
    const base = piece.toUpperCase();
    if (!["P","L","N","S","B","R"].includes(base)) return false;

    // Jogador entrando na zona inimiga (linhas 0–2)
    return isPlayerPiece(piece) && r <= 2;
}

function showPromotionModal(r,c,callback){
    const modal = document.getElementById("promotion-modal");
    modal.style.display="block";

    const yesBtn = document.getElementById("promote-yes");
    const noBtn = document.getElementById("promote-no");

    yesBtn.onclick = ()=>{
        modal.style.display="none";
        callback(true);
    };
    noBtn.onclick = ()=>{
        modal.style.display="none";
        callback(false);
    };
}

/* ============================================================
   MOVIMENTOS
============================================================ */
function makeMove(move, promotionChosen=null){
    const {from,to,piece} = move;
    const [fr,fc] = from;
    const [tr,tc] = to;
    const target = board[tr][tc];
    let logMsg = `${piece.toUpperCase()} para [${tr},${tc}]`;

    if(target!=="."){
        if(isPlayerPiece(piece)) capturedPlayer.push(unpromote(target));
        else capturedAI.push(unpromote(target));
        logMsg += `, capturou ${target.toUpperCase()}`;
    }

    let finalPiece = piece;
    if(canPromote(piece,tr) && !piece.endsWith("+")){
        if(forcePromotion(piece,tr)){
            finalPiece = promotePiece(piece);
            logMsg += " e promoveu!";
        } else if(promotionChosen===true){
            finalPiece = promotePiece(piece);
            logMsg += " e promoveu!";
        }
    }

    board[tr][tc] = finalPiece;
    board[fr][fc] = ".";
    renderCaptures();
    render();
    addLog(logMsg);
}

/* ============================================================
   LOG
============================================================ */
function addLog(msg){
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += msg+"<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
}

/* ============================================================
   RENDER
============================================================ */
function renderCaptures(){
    const pArea = document.getElementById("captures-player");
    const aArea = document.getElementById("captures-ai");
    pArea.innerHTML = "Suas capturas:<br>";
    aArea.innerHTML = "Capturas da IA:<br>";
    for(const p of capturedPlayer) pArea.innerHTML+=`<img class="piece" src="pieces/${pieceImageFromBase(p)}">`;
    for(const p of capturedAI) aArea.innerHTML+=`<img class="piece" src="pieces/${pieceImageFromBase(p)}">`;
}

function render(){
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML="";
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            const cell = document.createElement("div");
            cell.className="cell";
            cell.dataset.r=r;
            cell.dataset.c=c;
            const p = board[r][c];
            if(p!=="."){
                const img = document.createElement("img");
                //img.src="pieces/"+p.toUpperCase()+".svg";
                img.src = "pieces/" + p.toUpperCase() + ".svg";
				img.style.width="60px";
                img.style.height="60px";
                cell.appendChild(img);
            }
            cell.onclick=()=>handleClick(r,c);
            boardDiv.appendChild(cell);
        }
    }
    renderCaptures();
}

/* ============================================================
   CLIQUE NO TABULEIRO
============================================================ */
function handleClick(r,c){
    const clickedPiece = board[r][c];
    if(selectedPiece){
        const move = {from:selectedPiece,to:[r,c],piece:board[selectedPiece[0]][selectedPiece[1]]};
        const legal = legalMoves({r:selectedPiece[0],c:selectedPiece[1],p:move.piece}).some(m=>m.to[0]===r && m.to[1]===c);
        if(legal){
            if(canPromote(move.piece,r) && !move.piece.endsWith("+") && !forcePromotion(move.piece,r)){
                showPromotionModal(r,c,(choice)=>{
                    makeMove(move,choice);
                    setTimeout(aiPlay,300);
                });
            } else {
                makeMove(move);
                setTimeout(aiPlay,300);
            }
        }
        selectedPiece=null;
        clearHighlights();
        return;
    }
    if(clickedPiece!=="."){
        if(isPlayerPiece(clickedPiece)){
            selectedPiece=[r,c];
            highlightMoves(r,c,clickedPiece);
        }
    }
}

/* ============================================================
   IA SIMPLES
============================================================ */
function aiPlay(){
    if(gameOver) return;
    const moves=[];
    for(let r=0;r<9;r++){
        for(let c=0;c<9;c++){
            const p = board[r][c];
            if(p!== "." && isAIPiece(p)) legalMoves({r,c,p}).forEach(mv=>moves.push(mv));
        }
    }
    if(moves.length===0){ addLog("IA não tem jogadas. Você venceu!"); gameOver=true; return; }
    const move = randomChoice(moves);
    makeMove(move);
}

/* ============================================================
   INIT
============================================================ */
render();

// ---------- Help Modal ----------
document.addEventListener("DOMContentLoaded", () => {
    const helpBtn = document.getElementById("help-btn");
    const helpModal = document.getElementById("help-modal");
    const helpClose = document.getElementById("help-close");

    helpBtn.onclick = () => { helpModal.style.display = "block"; };
    helpClose.onclick = () => { helpModal.style.display = "none"; };
    window.onclick = (event) => { if (event.target === helpModal) helpModal.style.display = "none"; };
});
