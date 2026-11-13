// Tile system and collision
import { T, COLS, ROWS } from './constants.js';

const SOLID = new Set([T.GROUND, T.BRICK, T.QUESTION, T.USED, T.PIPE_TL, T.PIPE_TR, T.PIPE_BL, T.PIPE_BR]);
const BREAKABLE = new Set([T.BRICK, T.QUESTION]);

function isSolid(tile) {
  return SOLID.has(tile.type);
}

function isBreakable(tile) {
  return BREAKABLE.has(tile.type);
}

// AABB collision vs tile grid
function collideTiles(entity, tiles, levelWidth) {
  const { x, y, w, h, vx, vy } = entity;
  let onGround = false;

  // Predict new position
  let nx = x + vx;
  let ny = y + vy;

  // Horizontal
  let left = Math.floor(nx / 16);
  let right = Math.floor((nx + w - 1) / 16);
  let top = Math.floor(ny / 16);
  let bottom = Math.floor((ny + h - 1) / 16);

  for (let ty = top; ty <= bottom && ty < ROWS; ty++) {
    for (let tx = left; tx <= right && tx < COLS; tx++) {
      if (tx < 0 || tx >= (levelWidth / 16)) continue;
      if (ty < 0) continue;
      const tile = tiles[ty]?.[tx];
      if (!tile || !isSolid(tile)) continue;

      // Resolve horizontal
      if (vx > 0) {
        nx = tx * 16 - w;
        entity.vx = 0;
      } else if (vx < 0) {
        nx = (tx + 1) * 16;
        entity.vx = 0;
      }
    }
  }

  // Vertical
  left = Math.floor(nx / 16);
  right = Math.floor((nx + w - 1) / 16);
  top = Math.floor(ny / 16);
  bottom = Math.floor((ny + h - 1) / 16);

  for (let ty = top; ty <= bottom && ty < ROWS; ty++) {
    for (let tx = left; tx <= right && tx < COLS; tx++) {
      if (tx < 0 || tx >= (levelWidth / 16)) continue;
      if (ty < 0) continue;
      const tile = tiles[ty]?.[tx];
      if (!tile || !isSolid(tile)) continue;

      if (vy > 0) {
        ny = ty * 16 - h;
        entity.vy = 0;
        onGround = true;
      } else if (vy < 0) {
        ny = (ty + 1) * 16;
        entity.vy = 0;
        return { onGround: false, hitCeiling: true, tileX: tx, tileY: ty };
      }
    }
  }

  entity.x = nx;
  entity.y = ny;
  return { onGround, hitCeiling: false };
}

function hitBlock(tiles, tx, ty, levelWidth) {
  if (ty < 0 || ty >= ROWS) return null;
  if (tx < 0 || tx >= levelWidth / 16) return null;
  const tile = tiles[ty][tx];
  if (!tile || !isBreakable(tile)) return null;
  return tile;
}

function breakBlock(tiles, tx, ty) {
  if (ty < 0 || ty >= ROWS) return;
  if (tx < 0 || tx >= tiles[0].length) return;
  const tile = tiles[ty][tx];
  if (!tile || !isBreakable(tile)) return;
  tile.type = T.AIR;
}

function useBlock(tiles, tx, ty) {
  if (ty < 0 || ty >= ROWS) return null;
  if (tx < 0 || tx >= tiles[0].length) return null;
  const tile = tiles[ty][tx];
  if (!tile || tile.type !== T.QUESTION || tile.hit) return null;
  tile.type = T.USED;
  tile.hit = true;
  return 'coin'; // or 'powerup'
}

export { isSolid, isBreakable, collideTiles, hitBlock, breakBlock, useBlock, SOLID, BREAKABLE };
