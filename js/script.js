'use strict';

/**
 * ==========================================================================
 * UFO ABDUCTION - JOGO COMPLETO (INFINITE VARIANT)
 * Compatível com teclado (setas/WASD) e toque (D-pad + swipe)
 * ==========================================================================
 */

/* ==========================================================================
   ELEMENTOS DA INTERFACE (DOM)
   ========================================================================== */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const currentScoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const dpadButtons = document.querySelectorAll('.dpad-btn');

/* ==========================================================================
   CONFIGURAÇÕES GLOBAIS DA GRADE (GRID)
   ========================================================================== */
const GRID_SIZE = 20;
const HIGH_SCORE_KEY = 'ufo_abduction_highscore';
const BASE_SPEED = 110;   // ms entre frames no início
const MIN_SPEED = 50;     // velocidade máxima (menor intervalo permitido)
const SPEED_STEP = 5;     // redução de intervalo a cada aceleração
const SPEED_UP_EVERY = 5; // acelera a cada N vacas abduzidas
const SWIPE_THRESHOLD = 24; // distância mínima (px) para reconhecer um swipe

let gridWidth = canvas.width / GRID_SIZE;
let gridHeight = canvas.height / GRID_SIZE;

/* ==========================================================================
   ESTADO DO JOGO
   ========================================================================== */
let ufo = [];
let cow = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY), 10) || 0;
let gameInterval = null;
let gameSpeed = BASE_SPEED;
let isGameRunning = false;
let stars = [];

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    highScoreElement.textContent = highScore;
    generateStars();
    drawInitialState();
    setupKeyboardControls();
    setupTouchControls();
});

startButton.addEventListener('click', startMission);
resetButton.addEventListener('click', resetMission);

// Recalcula a grade lógica caso o canvas mude de tamanho (ex.: layout responsivo)
function syncGridDimensions() {
    gridWidth = canvas.width / GRID_SIZE;
    gridHeight = canvas.height / GRID_SIZE;
}

/* ==========================================================================
   MECÂNICAS PRINCIPAIS DO JOGO
   ========================================================================== */
function startMission() {
    syncGridDimensions();
    hideOverlay();

    if (!isGameRunning) {
        initGameVariables();
        isGameRunning = true;
        startGameLoop();
    }
}

function resetMission() {
    stopGameLoop();
    isGameRunning = false;

    resetOverlayToStartState();
    initGameVariables();
    draw();
}

function initGameVariables() {
    const startX = Math.floor(gridWidth / 2);
    const startY = Math.floor(gridHeight / 2);

    ufo = [
        { x: startX, y: startY },
        { x: startX, y: startY + 1 },
        { x: startX, y: startY + 2 }
    ];

    direction = { x: 0, y: -1 };
    nextDirection = { x: 0, y: -1 };
    score = 0;
    gameSpeed = BASE_SPEED;
    currentScoreElement.textContent = score;

    spawnCow();
}

function startGameLoop() {
    stopGameLoop();
    gameInterval = setInterval(update, gameSpeed);
}

function stopGameLoop() {
    clearInterval(gameInterval);
    gameInterval = null;
}

function update() {
    direction = nextDirection;

    const head = {
        x: ufo[0].x + direction.x,
        y: ufo[0].y + direction.y
    };

    if (isOutOfBounds(head) || collidesWithTrail(head)) {
        triggerGameOver();
        return;
    }

    ufo.unshift(head);

    if (head.x === cow.x && head.y === cow.y) {
        handleCowAbducted();
    } else {
        ufo.pop();
    }

    draw();
}

function isOutOfBounds(point) {
    return point.x < 0 || point.x >= gridWidth || point.y < 0 || point.y >= gridHeight;
}

function collidesWithTrail(point) {
    return ufo.some(segment => segment.x === point.x && segment.y === point.y);
}

function handleCowAbducted() {
    score++;
    currentScoreElement.textContent = score;

    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem(HIGH_SCORE_KEY, highScore);
    }

    // Aceleração progressiva infinita
    if (score % SPEED_UP_EVERY === 0 && gameSpeed > MIN_SPEED) {
        gameSpeed -= SPEED_STEP;
        startGameLoop();
    }

    spawnCow();
}

function triggerGameOver() {
    stopGameLoop();
    isGameRunning = false;

    overlayTitle.textContent = 'MISSÃO ABORTADA';
    overlayTitle.style.color = '#ff3366';
    overlayText.textContent = `Seu rastro colapsou! Você conseguiu abduzir ${score} vacas nesta rodada.`;
    startButton.textContent = 'Tentar Novamente';

    showOverlay();
}

/* ==========================================================================
   OVERLAY (TELA DE MENU / GAME OVER)
   ========================================================================== */
function showOverlay() {
    overlay.style.display = 'flex';
    setTimeout(() => { overlay.style.opacity = '1'; }, 10);
}

function hideOverlay() {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}

function resetOverlayToStartState() {
    startButton.textContent = 'Iniciar Missão';
    startButton.style.background = 'linear-gradient(135deg, #00ffcc 0%, #0099ff 100%)';
    startButton.style.color = '#070a11';
    startButton.style.boxShadow = '0 4px 15px rgba(0, 255, 204, 0.4)';

    overlayTitle.textContent = 'Nave Pronta';
    overlayTitle.style.color = '#00ffcc';
    overlayText.textContent = 'Abduza as vacas e evite colisões cósmicas!';

    showOverlay();
}

/* ==========================================================================
   ENTRADA DO JOGADOR (TECLADO + TOQUE)
   ========================================================================== */

// Só altera a direção se ela não for diretamente oposta à direção atual
// (evita que o OVNI colida com o próprio corpo instantaneamente)
function tryChangeDirection(dx, dy) {
    if (dx !== 0 && direction.x === -dx) return;
    if (dy !== 0 && direction.y === -dy) return;
    nextDirection = { x: dx, y: dy };
}

function handleDirectionInput(dirName) {
    if (!isGameRunning) return;

    switch (dirName) {
        case 'up':    tryChangeDirection(0, -1); break;
        case 'down':  tryChangeDirection(0, 1); break;
        case 'left':  tryChangeDirection(-1, 0); break;
        case 'right': tryChangeDirection(1, 0); break;
    }
}

function setupKeyboardControls() {
    const KEY_TO_DIRECTION = {
        ArrowUp: 'up', w: 'up', W: 'up',
        ArrowDown: 'down', s: 'down', S: 'down',
        ArrowLeft: 'left', a: 'left', A: 'left',
        ArrowRight: 'right', d: 'right', D: 'right'
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            isGameRunning ? resetMission() : startMission();
            return;
        }

        const dirName = KEY_TO_DIRECTION[e.key];
        if (dirName) handleDirectionInput(dirName);
    });
}

// D-pad na tela: funciona em qualquer dispositivo (mouse ou toque)
function setupTouchControls() {
    dpadButtons.forEach(button => {
        const dirName = button.dataset.dir;

        const onPress = (e) => {
            e.preventDefault(); // evita o "duplo disparo" de touch + click e o scroll da página
            handleDirectionInput(dirName);
        };

        button.addEventListener('touchstart', onPress, { passive: false });
        button.addEventListener('click', onPress);
    });

    setupSwipeControls();
}

// Swipe diretamente sobre o canvas, como alternativa ao D-pad
function setupSwipeControls() {
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < SWIPE_THRESHOLD) return;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            handleDirectionInput(deltaX > 0 ? 'right' : 'left');
        } else {
            handleDirectionInput(deltaY > 0 ? 'down' : 'up');
        }
    }, { passive: true });
}

/* ==========================================================================
   ENTIDADES E FUNÇÕES AUXILIARES
   ========================================================================== */
function spawnCow() {
    let validPosition = false;

    while (!validPosition) {
        cow.x = Math.floor(Math.random() * gridWidth);
        cow.y = Math.floor(Math.random() * gridHeight);
        validPosition = !collidesWithTrail(cow);
    }
}

function generateStars() {
    const STAR_COUNT = 45;
    stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3
    }));
}

/* ==========================================================================
   RENDERIZAÇÃO (CANVAS)
   ========================================================================== */
function draw() {
    ctx.fillStyle = '#0d131f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawCow();

    for (let i = ufo.length - 1; i > 0; i--) {
        drawTrailSegment(ufo[i].x, ufo[i].y, i);
    }

    if (ufo.length > 0) {
        drawUFOHead(ufo[0].x, ufo[0].y);
    }
}

function drawInitialState() {
    ctx.fillStyle = '#0d131f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawStars();
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCow() {
    const posX = cow.x * GRID_SIZE + GRID_SIZE / 2;
    const posY = cow.y * GRID_SIZE + GRID_SIZE / 2;

    ctx.font = `${GRID_SIZE - 2}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.fillText('🐄', posX, posY);
    ctx.shadowBlur = 0;
}

function drawTrailSegment(gridX, gridY, index) {
    const centerX = gridX * GRID_SIZE + GRID_SIZE / 2;
    const centerY = gridY * GRID_SIZE + GRID_SIZE / 2;

    const maxRadius = GRID_SIZE / 2.2;
    const minRadius = GRID_SIZE / 4;
    const factor = Math.min(index / 20, 1);
    const radius = maxRadius - (maxRadius - minRadius) * factor;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    const gradient = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, 'rgba(0, 153, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 51, 153, 0.15)');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#0099ff';
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawUFOHead(gridX, gridY) {
    const cx = gridX * GRID_SIZE + GRID_SIZE / 2;
    const cy = gridY * GRID_SIZE + GRID_SIZE / 2;

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffcc';

    ctx.fillStyle = 'rgba(0, 255, 204, 0.15)';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + 4, cy);
    ctx.lineTo(cx + 8, cy + GRID_SIZE / 1.2);
    ctx.lineTo(cx - 8, cy + GRID_SIZE / 1.2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, GRID_SIZE / 1.8, GRID_SIZE / 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, GRID_SIZE / 2.2, GRID_SIZE / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00ff66';
    ctx.beginPath();
    ctx.arc(cx, cy - 1, GRID_SIZE / 4, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}