// Player physics and state management
import { KEY, T } from './constants.js';
import { collideTiles, hitBlock, breakBlock, useBlock } from './tiles.js';

const GRAVITY = 0.45;
const MOVE_ACCEL = 0.35;
const MOVE_FRICTION = 0.82;
const MAX_SPEED = 2.5;
const RUN_MULT = 1.6;
const JUMP_VEL = -7.5;
const JUMP_HOLD_TIME = 12; // frames to hold for max jump
const JUMP_HOLD_VEL = -3.5; // velocity while holding jump
const SMALL_W = 14, SMALL_H = 16;
const BIG_W = 14, BIG_H = 30;

function createPlayer(level) {
  const spawn = level.spawn;
  return {
    x: spawn.x, y: spawn.y,
    w: SMALL_W, h: SMALL_H,
    vx: 0, vy: 0,
    facing: 1, // 1 = right, -1 = left
    state: 'small', // 'small' or 'big'
    onGround: false,
    jumping: false,
    jumpTimer: 0,
    jumpHeld: false,
    invincible: 0,
    dead: false,
    animFrame: 0,
    animTimer: 0,
  };
}

function resizePlayer(player, big) {
  player.state = big ? 'big' : 'small';
  player.h = big ? BIG_H : SMALL_H;
  player.w = big ? BIG_W : SMALL_W;
  player.invincible = 60; // 1 second of invincibility
}

function updatePlayer(player, input, tiles, levelWidth, enemies, items, onCoin, onPowerUp, onDie) {
  if (player.dead) return;

  // Invincibility timer
  if (player.invincible > 0) player.invincible--;

  // Animation
  player.animTimer++;
  if (player.animTimer > 8) {
    player.animTimer = 0;
    player.animFrame = (player.animFrame + 1) % 4;
  }

  // Horizontal movement
  let moveX = 0;
  if (input[KEY.LEFT]) moveX -= 1;
  if (input[KEY.RIGHT]) moveX += 1;

  if (moveX !== 0) {
    player.facing = moveX;
    const maxSpd = input[KEY.RUN] ? MAX_SPEED * RUN_MULT : MAX_SPEED;
    player.vx += moveX * MOVE_ACCEL;
    if (player.vx > maxSpd) player.vx = maxSpd;
    if (player.vx < -maxSpd) player.vx = -maxSpd;
  } else {
    player.vx *= MOVE_FRICTION;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
  }

  // Jump (variable height)
  if (input[KEY.JUMP] && !player.jumping && player.onGround) {
    player.vy = JUMP_VEL;
    player.jumping = true;
    player.jumpHeld = true;
    player.jumpTimer = 0;
    player.onGround = false;
  }

  if (player.jumping && player.jumpHeld && input[KEY.JUMP] && player.vy < 0) {
    player.jumpTimer++;
    if (player.jumpTimer < JUMP_HOLD_TIME) {
      player.vy = Math.max(player.vy + JUMP_HOLD_VEL / JUMP_HOLD_TIME, JUMP_VEL);
    }
  } else {
    player.jumpHeld = false;
  }

  if (!input[KEY.JUMP]) {
    player.jumping = false;
  }

  // Gravity
  player.vy += GRAVITY;
  if (player.vy > 8) player.vy = 8;

  // Apply collision
  const result = collideTiles(player, tiles, levelWidth);
  player.onGround = result.onGround;

  // Hit ceiling
  if (result.hitCeiling && player.vy < 0) {
    const tile = hitBlock(tiles, result.tileX, result.tileY, levelWidth);
    if (tile) {
      if (tile.type === T.QUESTION && !tile.hit) {
        const reward = useBlock(tiles, result.tileX, result.tileY, levelWidth);
        if (reward === 'coin') onCoin();
      } else if (tile.type === T.BRICK) {
        if (player.state === 'big') {
          breakBlock(tiles, result.tileX, result.tileY);
        }
      }
    }
  }

  // Check pit death
  if (player.y > levelHeight * 16) {
    onDie();
    return;
  }

  // Check enemy collisions
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy.dead) continue;
    if (rectsOverlap(player, enemy)) {
      // Stomp check: player falling and above enemy
      const playerBottom = player.y + player.h;
      const playerAbove = playerBottom - enemy.y < 10 && player.vy > 0;

      if (player.invincible > 0) {
        // Already invincible, skip
      } else if (playerAbove && enemy.type !== 'shell') {
        // Stomp enemy
        enemy.dead = true;
        player.vy = JUMP_VEL * 0.6;
      } else if (playerAbove && enemy.type === 'shell') {
        // Stomp shell, kick it
        enemy.dead = true;
        enemy.vx = player.facing * 5;
        enemy.vy = -3;
        player.vy = JUMP_VEL * 0.4;
      } else if (enemy.type === 'shell' && enemy.vx !== 0) {
        // Hit sliding shell
        onDie();
        return;
      } else {
        // Side hit - get hurt
        if (player.state === 'big') {
          resizePlayer(player, false);
        } else {
          onDie();
          return;
        }
      }
    }
  }

  // Check item collisions
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.collected) continue;
    if (rectsOverlap(player, item)) {
      if (item.type === 'coin') {
        item.collected = true;
        onCoin();
      } else if (item.type === 'powerup') {
        item.collected = true;
        onPowerUp();
      } else if (item.type === 'coin_block') {
        item.collected = true;
        onCoin();
      }
    }
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const levelHeight = 12; // rows

export { createPlayer, resizePlayer, updatePlayer, SMALL_W, SMALL_H, BIG_W, BIG_H, GRAVITY, MAX_SPEED, JUMP_VEL };
