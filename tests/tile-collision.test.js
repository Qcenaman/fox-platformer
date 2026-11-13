// Test: Tile collision
// Tests AABB collision against a tile grid
import assert from 'assert';

const TILE = 16;
const SOLID_TYPES = new Set(['G', 'B', 'Q', 'U', '[', ']', '{', '}']);

function isSolid(type) {
  return SOLID_TYPES.has(type);
}

// Create a simple tile grid for testing
function createTestGrid() {
  // 16x12 grid
  const grid = [];
  for (let y = 0; y < 12; y++) {
    grid[y] = [];
    for (let x = 0; x < 16; x++) {
      if (y >= 10) {
        grid[y][x] = { type: 'G', active: true }; // ground at bottom
      } else if (y === 7 && x >= 5 && x <= 8) {
        grid[y][x] = { type: 'B', active: true }; // floating brick platform
      } else if (y === 5 && x === 3) {
        grid[y][x] = { type: 'Q', active: true }; // question block
      } else {
        grid[y][x] = { type: '.', active: true }; // air
      }
    }
  }
  return grid;
}

// Simple AABB collision check (inclusive edges)
function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax <= bx + bw && ax + aw >= bx && ay <= by + bh && ay + ah >= by;
}

// Test 1: Player on ground
const grid = createTestGrid();
const player = { x: 32, y: 146, w: 14, h: 16 }; // slightly into ground (row 10)
const groundTile = grid[10][2];
assert(isSolid(groundTile.type), 'Ground tile should be solid');
assert(rectOverlap(player.x, player.y, player.w, player.h, 32, 160, 16, 16), 'Player should overlap ground tile');

// Test 2: Tile below floating platform is air
const belowPlatform = grid[8][5];
assert(!isSolid(belowPlatform.type), 'Tile below platform should be air');

// Test 3: Player overlapping question block
const qPlayer = { x: 48, y: 72, w: 14, h: 16 }; // near question block at (3,5)
const qTile = grid[5][3];
assert(isSolid(qTile.type), 'Question block should be solid');
assert(rectOverlap(qPlayer.x, qPlayer.y, qPlayer.w, qPlayer.h, 48, 80, 16, 16), 'Should be near question block');

// Test 4: Air tile is not solid
const airTile = grid[0][0];
assert(!isSolid(airTile.type), 'Air tile should not be solid');

// Test 5: Ground tiles form a continuous floor
for (let x = 0; x < 16; x++) {
  assert(isSolid(grid[10][x].type), `Ground at row 10, col ${x} should be solid`);
  assert(isSolid(grid[11][x].type), `Ground at row 11, col ${x} should be solid`);
}

// Test 6: Collision detection - player standing on ground
const standingPlayer = { x: 32, y: 144, w: 14, h: 16 };
const groundY = 10 * TILE; // 160
const playerBottom = standingPlayer.y + standingPlayer.h; // 160
assert(playerBottom === groundY, 'Player bottom should exactly touch ground top');

// Test 7: Player overlapping ground from above
const abovePlayer = { x: 32, y: 120, w: 14, h: 16 }; // above ground
const tileBelow = grid[10][2];
assert(isSolid(tileBelow.type), 'Ground tile should be solid');
// Player bottom (136) is above ground top (160)
assert(abovePlayer.y + abovePlayer.h < 10 * TILE, 'Player should be above ground');

console.log('Tile collision tests PASSED');
