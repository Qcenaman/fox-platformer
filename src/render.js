// Rendering: draws all game elements to canvas
import { W, H, TILE, PAL, T } from './constants.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;
ctx.imageSmoothingEnabled = false;

// Pixel art sprite data (16x16 or 14x16 etc as arrays of color indices)
// Each row is a string of palette index chars

// Fox hero - small (14x16)
const SPRITE_FOX_SMALL = [
  '......1111111.....',
  '.....111111111....',
  '....11111111111...',
  '....171717171717..',
  '..11111111111111..',
  '..11111111111111..',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '....11111111111...',
  '....11...111111...',
  '....11...111111...',
];

// Fox hero - big (14x30)
const SPRITE_FOX_BIG = [
  '......1111111.....',
  '.....111111111....',
  '....11111111111...',
  '....171717171717..',
  '..11111111111111..',
  '..11111111111111..',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '...11111111111111.',
  '....11111111111...',
  '....11...111111...',
];

// Mushroom power-up (14x14)
const SPRITE_MUSHROOM = [
  '......777777......',
  '.....77777777.....',
  '....7777777777....',
  '....7177771777....',
  '...777777777777...',
  '...777777777777...',
  '...777777777777...',
  '....111111111.....',
  '...111111111111...',
  '...111111111111...',
  '...111111111111...',
  '...111111111111...',
  '....111111111.....',
  '....111111111.....',
];

// Walker enemy (16x16)
const SPRITE_WALKER = [
  '....111111111.....',
  '...11111111111....',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '..1111111111111...',
  '...11111111111....',
  '...11111111111....',
];

// Shell enemy (16x16)
const SPRITE_SHELL = [
  '.....8888888.....',
  '....888888888....',
  '...88888888888...',
  '..8888888888888..',
  '.888888888888888.',
  '88888888888888888',
  '88888888888888888',
  '88888888888888888',
  '88888888888888888',
  '88888888888888888',
  '88888888888888888',
  '88888888888888888',
  ' 888888888888888 ',
  '  8888888888888  ',
  '  8888888888888  ',
  '   88888888888   ',
];

// Coin (10x12)
const SPRITE_COIN = [
  '...666666...',
  '..66666666..',
  '.6666666666.',
  '666666666666',
  '666666666666',
  '666666666666',
  '666666666666',
  '666666666666',
  '.6666666666.',
  '..66666666..',
  '...666666...',
  '...666666...',
];

// Flag (16x48 for pole + flag)
const SPRITE_FLAG_POLE = [
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
];

// Draw a pixel sprite from a string array
function drawSprite(ctx, sprite, px, py, palette, scaleX = 1, scaleY = 1) {
  for (let y = 0; y < sprite.length; y++) {
    for (let x = 0; x < sprite[y].length; x++) {
      const ch = sprite[y][x];
      if (ch === ' ') continue;
      const color = PAL['_' + ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(px + x * scaleX),
          Math.floor(py + y * scaleY),
          Math.ceil(scaleX),
          Math.ceil(scaleY)
        );
      }
    }
  }
}

// Draw a tile
function drawTile(ctx, tile, tx, ty, camX, camY) {
  const sx = tx * TILE - camX;
  const sy = ty * TILE - camY;
  if (sx < -TILE || sx > W || sy < -TILE || sy > H) return;

  switch (tile.type) {
    case T.GROUND:
      ctx.fillStyle = PAL._5;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL._4;
      ctx.fillRect(sx, sy, TILE, 4);
      ctx.fillStyle = PAL._48;
      ctx.fillRect(sx + 2, sy + 6, 4, 3);
      ctx.fillRect(sx + 10, sy + 10, 4, 3);
      break;
    case T.BRICK:
      ctx.fillStyle = PAL._7;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL._2;
      ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillRect(sx, sy + 7, TILE, 1);
      ctx.fillRect(sx + 7, sy, 1, 7);
      ctx.fillRect(sx + 3, sy + 8, 1, 8);
      ctx.fillRect(sx + 11, sy + 8, 1, 8);
      ctx.fillRect(sx + 7, sy + 8, 1, 8);
      break;
    case T.QUESTION:
      ctx.fillStyle = PAL._e;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL._2;
      ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillRect(sx, sy + 15, TILE, 1);
      ctx.fillRect(sx, sy, 1, TILE);
      ctx.fillRect(sx + 15, sy, 1, TILE);
      ctx.fillStyle = PAL._1;
      ctx.font = '10px monospace';
      ctx.fillText('?', sx + 5, sy + 12);
      break;
    case T.USED:
      ctx.fillStyle = PAL._c;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL._j;
      ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillRect(sx, sy + 15, TILE, 1);
      ctx.fillRect(sx, sy, 1, TILE);
      ctx.fillRect(sx + 15, sy, 1, TILE);
      break;
    case T.PIPE_TL:
      ctx.fillStyle = PAL._4;
      ctx.fillRect(sx - 2, sy, TILE + 2, TILE);
      ctx.fillStyle = PAL._5;
      ctx.fillRect(sx - 2, sy, 3, TILE);
      ctx.fillStyle = PAL._d;
      ctx.fillRect(sx + 4, sy, 4, TILE);
      break;
    case T.PIPE_TR:
      ctx.fillStyle = PAL._4;
      ctx.fillRect(sx, sy, TILE + 2, TILE);
      ctx.fillStyle = PAL._5;
      ctx.fillRect(sx + TILE - 1, sy, 3, TILE);
      ctx.fillStyle = PAL._d;
      ctx.fillRect(sx + 2, sy, 4, TILE);
      break;
    case T.PIPE_BL:
      ctx.fillStyle = PAL._5;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL._4;
      ctx.fillRect(sx + 3, sy, 4, TILE);
      break;
    case T.PIPE_BR:
      ctx.fillStyle = PAL._5;
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = PAL._4;
      ctx.fillRect(sx + 3, sy, 4, TILE);
      break;
    case T.PLATFORM:
      ctx.fillStyle = PAL._c;
      ctx.fillRect(sx, sy, TILE, 4);
      ctx.fillStyle = PAL._j;
      ctx.fillRect(sx, sy + 4, TILE, 2);
      break;
    case T.FLAG:
      ctx.fillStyle = PAL._1;
      ctx.fillRect(sx + 7, sy, 2, TILE);
      ctx.fillStyle = PAL._7;
      ctx.fillRect(sx, sy + 2, 8, 6);
      break;
    case T.FLAG_POLE:
      ctx.fillStyle = PAL._1;
      ctx.fillRect(sx + 7, sy, 2, TILE);
      break;
    case T.SPIKE:
      ctx.fillStyle = PAL._c;
      ctx.beginPath();
      ctx.moveTo(sx + 8, sy);
      ctx.lineTo(sx + 16, sy + 16);
      ctx.lineTo(sx, sy + 16);
      ctx.fill();
      break;
  }
}

// Draw sky background
function drawBackground(ctx, camX) {
  // Sky gradient
  ctx.fillStyle = PAL._0;
  ctx.fillRect(0, 0, W, H);

  // Distant mountains (parallax)
  ctx.fillStyle = PAL._5;
  for (let x = -((camX * 0.2) % 64); x < W + 64; x += 64) {
    ctx.fillRect(x, H - 80, 40, 40);
    ctx.fillRect(x + 12, H - 96, 16, 16);
  }

  // Hills (parallax)
  ctx.fillStyle = PAL._4;
  for (let x = -((camX * 0.5) % 80); x < W + 80; x += 80) {
    ctx.fillRect(x, H - 50, 50, 30);
    ctx.fillRect(x + 10, H - 60, 30, 10);
  }

  // Clouds
  ctx.fillStyle = PAL._f;
  for (let x = -((camX * 0.1) % 120); x < W + 120; x += 120) {
    ctx.fillRect(x + 20, 30, 40, 10);
    ctx.fillRect(x + 30, 24, 20, 6);
  }
}

// Draw HUD
function drawHUD(ctx, score, coins, world, timer, lives) {
  ctx.fillStyle = PAL._0;
  ctx.fillRect(0, 0, W, 28);
  ctx.fillStyle = PAL._1;
  ctx.font = '8px monospace';
  ctx.textAlign = 'left';

  ctx.fillText('FOX', 8, 10);
  ctx.fillText(String(score).padStart(6, '0'), 8, 22);

  ctx.textAlign = 'center';
  ctx.fillText('x' + String(coins % 100).padStart(2, '0'), 64, 22);

  ctx.fillText('W' + world, 128, 10);
  ctx.fillText(String(timer).padStart(3, '0'), 128, 22);

  ctx.textAlign = 'right';
  ctx.fillText('♥' + lives, W - 8, 22);
}

// Draw title screen
function drawTitleScreen(ctx) {
  ctx.fillStyle = PAL._0;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = PAL._7;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FOX', W / 2, 60);
  ctx.fillStyle = PAL._e;
  ctx.fillText('ADVENTURE', W / 2, 84);

  // Fox sprite
  drawSprite(ctx, SPRITE_FOX_SMALL, W / 2 - 14, 100, PAL);

  // Instructions
  ctx.fillStyle = PAL._1;
  ctx.font = '8px monospace';
  ctx.fillText('PRESS ENTER OR SPACE', W / 2, 150);
  ctx.fillText('TO START', W / 2, 164);

  ctx.fillStyle = PAL._c;
  ctx.font = '6px monospace';
  ctx.fillText('ARROWS/A-D: MOVE', W / 2, 190);
  ctx.fillText('SPACE/Z: JUMP', W / 2, 200);
  ctx.fillText('SHIFT/X: RUN', W / 2, 210);

  // High score
  const highScore = localStorage.getItem('foxHighScore') || '0';
  ctx.fillStyle = PAL._6;
  ctx.fillText('HIGH SCORE: ' + String(parseInt(highScore)).padStart(6, '0'), W / 2, 230);
}

// Draw game over screen
function drawGameOverScreen(ctx) {
  ctx.fillStyle = PAL._0;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = PAL._7;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 20);

  ctx.fillStyle = PAL._1;
  ctx.font = '8px monospace';
  ctx.fillText('PRESS ENTER TO RESTART', W / 2, H / 2 + 10);
}

// Draw level complete screen
function drawLevelComplete(ctx, score, timeBonus) {
  ctx.fillStyle = PAL._0;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = PAL._6;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LEVEL COMPLETE!', W / 2, 60);

  ctx.fillStyle = PAL._1;
  ctx.font = '8px monospace';
  ctx.fillText('SCORE: ' + String(score).padStart(6, '0'), W / 2, 100);
  ctx.fillText('TIME BONUS: ' + timeBonus, W / 2, 116);

  ctx.fillStyle = PAL._4;
  ctx.fillText('PRESS ENTER TO CONTINUE', W / 2, 160);
}

// Draw pause screen
function drawPauseScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = PAL._1;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', W / 2, H / 2);

  ctx.font = '8px monospace';
  ctx.fillText('PRESS ENTER TO RESUME', W / 2, H / 2 + 20);
}

export {
  canvas, ctx, drawSprite, drawTile, drawBackground,
  drawHUD, drawTitleScreen, drawGameOverScreen,
  drawLevelComplete, drawPauseScreen,
  SPRITE_FOX_SMALL, SPRITE_FOX_BIG, SPRITE_MUSHROOM,
  SPRITE_WALKER, SPRITE_SHELL, SPRITE_COIN,
};
