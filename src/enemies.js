// Enemy system: walkers and shells
import { GRAVITY } from './player.js';
import { collideTiles } from './tiles.js';

const ENEMY_W = 16, ENEMY_H = 16;

function createWalker(x, y) {
  return {
    type: 'walker', x, y, w: ENEMY_W, h: ENEMY_H,
    vx: -1, vy: 0,
    dead: false, squished: false, squishTimer: 0,
    animFrame: 0, animTimer: 0,
  };
}

function createShell(x, y) {
  return {
    type: 'shell', x, y, w: ENEMY_W, h: ENEMY_H,
    vx: 0, vy: 0,
    dead: false, sliding: false,
    animFrame: 0, animTimer: 0,
  };
}

function updateEnemy(enemy, tiles, levelWidth, otherEnemies, onEnemyDefeated) {
  if (enemy.dead) return;

  // Squish timer
  if (enemy.squished) {
    enemy.squishTimer--;
    if (enemy.squishTimer <= 0) enemy.dead = true;
    return;
  }

  // Animation
  enemy.animTimer++;
  if (enemy.animTimer > 12) {
    enemy.animTimer = 0;
    enemy.animFrame = (enemy.animFrame + 1) % 2;
  }

  // Apply gravity
  enemy.vy += GRAVITY;
  if (enemy.vy > 8) enemy.vy = 8;

  // Move
  const result = collideTiles(enemy, tiles, levelWidth);

  // Turn at walls
  if (enemy.vx === 0 && !enemy.sliding) {
    enemy.vx = enemy.type === 'walker' ? -1 : 0;
  }

  if (enemy.type === 'walker') {
    if (!result.onGround) {
      // Turn at edges
      const nextX = enemy.x + enemy.vx;
      const footX = enemy.vx > 0 ? nextX + enemy.w : nextX;
      const footY = enemy.y + enemy.h + 2;
      const tileBelow = Math.floor(footY / 16);
      const tileX = Math.floor((enemy.vx > 0 ? footX + enemy.w : footX) / 16);
      if (tiles[tileBelow]?.[tileX] === undefined || tiles[tileBelow]?.[tileX]?.type === '.') {
        enemy.vx *= -1;
      }
    }
    if (enemy.vx === 0) enemy.vx = -1;
  } else if (enemy.type === 'shell' && enemy.sliding) {
    // Shell slides and bounces
    enemy.vy += GRAVITY;
    if (enemy.vy > 8) enemy.vy = 8;
    const shellResult = collideTiles(enemy, tiles, levelWidth);
    if (shellResult.onGround) {
      // Check for other enemies to defeat
      for (const other of otherEnemies) {
        if (other === enemy || other.dead) continue;
        if (other.squished) continue;
        if (rectsOverlap(enemy, other)) {
          other.dead = true;
          if (onEnemyDefeated) onEnemyDefeated();
        }
      }
    }
    // Turn at walls for shell
    if (enemy.vx !== 0 && !shellResult.onGround) {
      // check if about to hit wall
    }
  }

  // Remove if off screen
  if (enemy.y > 240) enemy.dead = true;
}

function stompEnemy(enemy) {
  if (enemy.squished) return;
  if (enemy.type === 'shell') {
    enemy.sliding = true;
    enemy.vx = 5;
    enemy.dead = false;
  } else {
    enemy.squished = true;
    enemy.squishTimer = 30;
    enemy.h = 8;
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export { createWalker, createShell, updateEnemy, stompEnemy, ENEMY_W, ENEMY_H };
