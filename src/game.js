// Main game loop and state management
import { W, TILE, STATE, KEY, T, PAL } from './constants.js';
import { isDown, pollGamepad, setup } from './input.js';
import { LEVELS, parseLevel, getSpawn, getFlagPos } from './levels.js';
import { createPlayer, updatePlayer } from './player.js';
import { createWalker, createShell, updateEnemy } from './enemies.js';
import { updateItem } from './items.js';
import { createCamera, updateCamera } from './camera.js';
import { initAudio, startMusic, stopMusic, sfxCoin, sfxPowerUp, sfxDeath, sfx1UP } from './audio.js';
import {
  ctx, drawSprite, drawTile, drawBackground,
  drawHUD, drawTitleScreen, drawGameOverScreen,
  drawLevelComplete, drawPauseScreen,
  SPRITE_FOX_SMALL, SPRITE_FOX_BIG, SPRITE_MUSHROOM,
  SPRITE_WALKER, SPRITE_SHELL, SPRITE_COIN,
} from './render.js';

let gameState = STATE.TITLE;
let currentLevel = 0;
let score = 0;
let coinCount = 0;
let lives = 3;
let timer = 400;
let timerAccum = 0;
let player, camera, tiles, levelWidth, enemies, items;
let flagPos = null;
let levelCompleteTimer = 0;
let transitionTimer = 0;
let paused = false;
let lastTime = 0;
let accumulator = 0;

function init() {
  setup();
  loadLevel(0);
  requestAnimationFrame(gameLoop);
}

function loadLevel(index) {
  currentLevel = index;
  const map = LEVELS[index % LEVELS.length];
  const levelData = parseLevel(map);
  tiles = levelData.tiles;
  levelWidth = levelData.width * TILE;
  player = createPlayer({ spawn: getSpawn(levelData), height: levelData.height });
  camera = createCamera();
  flagPos = getFlagPos(levelData);

  // Place enemies
  enemies = [];
  items = [];

  // Add walkers at specific positions
  enemies.push(createWalker(12 * TILE, 9 * TILE));
  enemies.push(createWalker(22 * TILE, 9 * TILE));
  enemies.push(createWalker(35 * TILE, 9 * TILE));

  // Add shells
  enemies.push(createShell(28 * TILE, 9 * TILE));

  // Reset timer
  timer = 400;
  timerAccum = 0;
}

function resetGame() {
  score = 0;
  coinCount = 0;
  lives = 3;
  loadLevel(0);
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let delta = timestamp - lastTime;
  lastTime = timestamp;

  // Cap delta to prevent spiral of death
  if (delta > 100) delta = 100;

  accumulator += delta;

  while (accumulator >= 16.67) { // ~60 FPS fixed timestep
    update();
    accumulator -= 16.67;
  }

  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  pollGamepad();

  switch (gameState) {
    case STATE.TITLE:
      if (isDown(KEY.JUMP) || isDown(KEY.PAUSE)) {
        initAudio();
        resetGame();
        gameState = STATE.PLAYING;
        startMusic();
      }
      break;

    case STATE.PLAYING:
      if (isDown(KEY.PAUSE) && !paused) {
        paused = true;
        gameState = STATE.PAUSED;
        stopMusic();
        return;
      }
      updatePlaying();
      break;

    case STATE.PAUSED:
      if (isDown(KEY.PAUSE)) {
        paused = false;
        gameState = STATE.PLAYING;
        startMusic();
      }
      break;

    case STATE.LEVEL_COMPLETE:
      levelCompleteTimer++;
      if (levelCompleteTimer > 60 && (isDown(KEY.JUMP) || isDown(KEY.PAUSE))) {
        if (currentLevel < LEVELS.length - 1) {
          loadLevel(currentLevel + 1);
          gameState = STATE.PLAYING;
          startMusic();
        } else {
          // Game complete - loop back to start with higher score
          gameState = STATE.TITLE;
        }
        levelCompleteTimer = 0;
      }
      break;

    case STATE.GAME_OVER:
      if (isDown(KEY.JUMP) || isDown(KEY.PAUSE)) {
        resetGame();
        gameState = STATE.PLAYING;
        startMusic();
      }
      break;

    case STATE.TRANSITION:
      transitionTimer++;
      if (transitionTimer > 60) {
        gameState = STATE.PLAYING;
        startMusic();
      }
      break;
  }
}

function updatePlaying() {
  const input = {
    [KEY.LEFT]: isDown(KEY.LEFT),
    [KEY.RIGHT]: isDown(KEY.RIGHT),
    [KEY.UP]: isDown(KEY.UP),
    [KEY.DOWN]: isDown(KEY.DOWN),
    [KEY.JUMP]: isDown(KEY.JUMP),
    [KEY.RUN]: isDown(KEY.RUN),
  };

  // Update player
  updatePlayer(
    player, input, tiles, levelWidth,
    enemies, items,
    () => onCoin(),
    () => onPowerUp(),
    () => onDie()
  );

  // Update camera
  updateCamera(camera, player, levelWidth);

  // Update enemies
  for (const enemy of enemies) {
    updateEnemy(enemy, tiles, levelWidth, enemies, () => {
      score += 100;
    });
  }

  // Update items
  for (const item of items) {
    updateItem(item, tiles, levelWidth);
  }

  // Clean up dead enemies and collected items
  enemies = enemies.filter(e => !e.dead || e.squished);
  items = items.filter(i => !i.collected);

  // Timer
  timerAccum++;
  if (timerAccum >= 60) {
    timerAccum = 0;
    timer--;
    if (timer <= 0) {
      onDie();
    }
  }

  // Check flag
  if (flagPos && !player.dead) {
    if (player.x + player.w > flagPos.x && player.x < flagPos.x + TILE) {
      onLevelComplete();
    }
  }
}

function onCoin() {
  coinCount++;
  score += 200;
  sfxCoin();

  // Extra life at 100 coins
  if (coinCount >= 100) {
    coinCount = 0;
    lives++;
    sfx1UP();
  }
}

function onPowerUp() {
  if (player.state === 'small') {
    sfxPowerUp();
  }
  // Always make big
  const wasBig = player.state === 'big';
  resizePlayer(player, true);
  if (!wasBig) sfxPowerUp();
  score += 1000;
}

function onDie() {
  if (player.dead) return;
  player.dead = true;
  player.vy = -8;
  sfxDeath();
  stopMusic();

  setTimeout(() => {
    lives--;
    if (lives <= 0) {
      // Save high score
      const hs = parseInt(localStorage.getItem('foxHighScore') || '0');
      if (score > hs) {
        localStorage.setItem('foxHighScore', String(score));
      }
      gameState = STATE.GAME_OVER;
    } else {
      loadLevel(currentLevel);
      gameState = STATE.PLAYING;
      startMusic();
    }
  }, 1000);
}

function onLevelComplete() {
  gameState = STATE.LEVEL_COMPLETE;
  stopMusic();
  levelCompleteTimer = 0;
  score += timer * 50; // Time bonus
  sfxPowerUp();
}

function render() {
  switch (gameState) {
    case STATE.TITLE:
      drawTitleScreen(ctx);
      break;

    case STATE.PLAYING:
    case STATE.PAUSED:
      renderGame();
      if (paused) drawPauseScreen(ctx);
      break;

    case STATE.LEVEL_COMPLETE:
      renderGame();
      drawLevelComplete(ctx, score, timer * 50);
      break;

    case STATE.GAME_OVER:
      drawGameOverScreen(ctx);
      break;
  }
}

function renderGame() {
  // Background
  drawBackground(ctx, camera.x);

  // Tiles
  const startCol = Math.max(0, Math.floor(camera.x / TILE) - 1);
  const endCol = Math.min(tiles[0].length, Math.ceil((camera.x + W) / TILE) + 1);

  for (let y = 0; y < tiles.length; y++) {
    for (let x = startCol; x < endCol; x++) {
      const tile = tiles[y]?.[x];
      if (tile && tile.type !== T.AIR) {
        drawTile(ctx, tile, x, y, camera.x, camera.y || 0);
      }
    }
  }

  // Items
  for (const item of items) {
    if (item.collected) continue;
    if (item.type === 'coin' || item.type === 'coin_block') {
      drawSprite(ctx, SPRITE_COIN, item.x - camera.x, item.y - (camera.y || 0), PAL);
    } else if (item.type === 'powerup') {
      drawSprite(ctx, SPRITE_MUSHROOM, item.x - camera.x, item.y - (camera.y || 0), PAL);
    }
  }

  // Enemies
  for (const enemy of enemies) {
    if (enemy.dead && !enemy.squished) continue;
    const ex = enemy.x - camera.x;
    const ey = enemy.y - (camera.y || 0);
    if (enemy.squished) {
      drawSprite(ctx, SPRITE_SHELL, ex, ey + 8, PAL);
    } else if (enemy.type === 'walker') {
      drawSprite(ctx, SPRITE_WALKER, ex, ey, PAL);
    } else if (enemy.type === 'shell') {
      drawSprite(ctx, SPRITE_SHELL, ex, ey, PAL);
    }
  }

  // Player
  if (!player.dead || player.vy < 0) {
    const sprite = player.state === 'big' ? SPRITE_FOX_BIG : SPRITE_FOX_SMALL;
    // Blink when invincible
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) {
      // Don't draw
    } else {
      const px = player.x - camera.x;
      const py = player.y - (camera.y || 0);
      if (player.facing === -1) {
        // Flip sprite by drawing from right
        for (let y = 0; y < sprite.length; y++) {
          for (let x = 0; x < sprite[y].length; x++) {
            const ch = sprite[y][sprite[y].length - 1 - x];
            if (ch === ' ') continue;
            const color = PAL['_' + ch];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(Math.floor(px + x), Math.floor(py + y), 1, 1);
            }
          }
        }
      } else {
        drawSprite(ctx, sprite, px, py, PAL);
      }
    }
  }

  // HUD
  drawHUD(ctx, score, coinCount, currentLevel + 1, timer, lives);
}

// Make resizePlayer accessible
function resizePlayer(player, big) {
  if (big && player.state === 'small') {
    player.h = 30;
    player.y -= 14;
  } else if (!big && player.state === 'big') {
    player.h = 16;
    player.y += 14;
  }
  player.state = big ? 'big' : 'small';
  player.invincible = 60;
}

// Start the game
init();
