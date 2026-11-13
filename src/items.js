// Item system: power-up mushrooms, coins
import { GRAVITY } from './player.js';
import { collideTiles } from './tiles.js';

const ITEM_W = 14, ITEM_H = 14;

function createPowerUp(x, y) {
  return {
    type: 'powerup', x, y, w: ITEM_W, h: ITEM_H,
    vx: 1, vy: 0,
    collected: false, emerging: y, emergeTarget: y - 32,
  };
}

function createCoin(x, y) {
  return {
    type: 'coin', x, y, w: 10, h: 12,
    collected: false, vy: -6,
    score: 0, // will be set by score system
  };
}

function createCoinBlockCoin(x, y) {
  return {
    type: 'coin_block', x, y, w: 10, h: 12,
    collected: false, vy: -6,
    score: 0,
  };
}

function updateItem(item, tiles, levelWidth) {
  if (item.collected) return;

  // Emerging from block
  if (item.emerging !== undefined) {
    if (item.y > item.emergeTarget) {
      item.y -= 1;
    } else {
      item.emerging = false;
    }
    return;
  }

  // Coin pop animation
  if (item.vy !== undefined && item.type !== 'powerup') {
    item.vy += 0.3;
    item.y += item.vy;
    if (item.vy > 0 && item.y > (item.y + item.vy - 0.3)) {
      // Done animating
    }
    return;
  }

  // Power-up sliding
  if (item.type === 'powerup') {
    item.vy += GRAVITY;
    if (item.vy > 8) item.vy = 8;
    const result = collideTiles(item, tiles, levelWidth);
    if (!result.onGround) {
      // Keep sliding
    }
  }
}

export { createPowerUp, createCoin, createCoinBlockCoin, updateItem, ITEM_W, ITEM_H };
