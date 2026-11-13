// Level definitions as text maps
// Each row is a string of tile characters.
// . = air, G = ground, B = brick, Q = question block
// [ ] = pipe top, { } = pipe body, P = platform
// F = flag, | = flag pole, D = decoration, ^ = spike

import { T, TILE } from './constants.js';

const LEVELS = [
  // Level 1 - Green Hills
  [
    '........................................................................................................',
    '........................................................................................................',
    '........................................................................................................',
    '........................................................................................................',
    '...................................................QQQ................................................',
    '............................QQQ.....................B.B.Q.B.............................................',
    '...........................B.B.B...................B.B.B.B.B............................................',
    '.......Q.B.Q.......................................B.B.B.B.B.B..........................................',
    '..................................................B.B.B.B.B.B.B.....................F...................',
    '...........B.B.B......................[...........B.B.B.B.B.B.B....................|...................',
    '.....................G.G.G.G.G.G.G.G.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    '.....................G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.GGGG',
  ],
  // Level 2 - Cave Adventure
  [
    '........................................................................................................',
    '........................................................................................................',
    '........................................................................................................',
    '........................................................................................................',
    '.........................................QQQ.................QQQ........................................',
    '...........................QQQ.........B.B.B.............B.B.B.B.B......................................',
    '...................QQQ...B.B.B.......B.B.B.B...........B.B.B.B.B.B....................................',
    '....Q.B.Q...........B.B.B.B.B.........B.B.B.B.........B.B.B.B.B.B.B...................................',
    '.....................................B.B.B.B.B.......B.B.B.B.B.B.B.B..................F.................',
    '.....B.B.B.....................[.....B.B.B.B.B......B.B.B.B.B.B.B.B..................|.................',
    '....G.G.G.G.G.G.G.G.G.G.G.G.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
    '....G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.G.GGGG',
  ],
];

// Parse a level map into a tile grid
function parseLevel(map) {
  const rows = map.length;
  const cols = Math.max(...map.map(r => r.length));
  const tiles = [];
  for (let y = 0; y < rows; y++) {
    tiles[y] = [];
    for (let x = 0; x < cols; x++) {
      const ch = x < map[y].length ? map[y][x] : T.AIR;
      tiles[y][x] = { type: ch, active: true, hit: false };
    }
  }
  return { tiles, width: cols, height: rows };
}

// Get spawn position for a level (first ground tile near left)
function getSpawn(level) {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x].type === T.GROUND) {
        return { x: x * TILE + 2, y: y * TILE - TILE * 2 };
      }
    }
  }
  return { x: 32, y: 100 };
}

// Find flag position
function getFlagPos(level) {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x].type === T.FLAG) {
        return { x: x * TILE, y: y * TILE };
      }
    }
  }
  return null;
}

// Count walkable tiles (for level width calc)
function getLevelWidth(level) {
  return level.width * TILE;
}

export { LEVELS, parseLevel, getSpawn, getFlagPos, getLevelWidth };
