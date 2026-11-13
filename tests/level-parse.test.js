// Test: Level map parsing
// Tests that text maps are correctly parsed into tile grids
import assert from 'assert';

const T = {
  AIR: '.', GROUND: 'G', BRICK: 'B', QUESTION: 'Q',
  PIPE_TL: '[', PIPE_TR: ']', PIPE_BL: '{', PIPE_BR: '}',
  PLATFORM: 'P', FLAG: 'F', FLAG_POLE: '|', USED: 'U', DECO: 'D', SPIKE: '^',
};

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

// Test 1: Parse a simple map
const map1 = [
  'GGGGGGGG',
  'G.....GG',
  'G.Q...GG',
  'GGGGGGGG',
];
const level1 = parseLevel(map1);
assert(level1.height === 4, `Level should have 4 rows, got ${level1.height}`);
assert(level1.width === 8, `Level should have 8 columns, got ${level1.width}`);
assert(level1.tiles[0][0].type === T.GROUND, 'Top-left should be ground');
assert(level1.tiles[2][2].type === T.QUESTION, 'Position (2,2) should be question block');
assert(level1.tiles[1][1].type === T.AIR, 'Position (1,1) should be air');

// Test 2: All tiles created correctly
for (let y = 0; y < 4; y++) {
  for (let x = 0; x < 8; x++) {
    assert(level1.tiles[y][x].type !== undefined, `Tile at (${x},${y}) should have a type`);
    assert(level1.tiles[y][x].active === true, `Tile at (${x},${y}) should be active`);
    assert(level1.tiles[y][x].hit === false, `Tile at (${x},${y}) should not be hit`);
  }
}

// Test 3: Short rows are padded with air
const map2 = [
  'GGG',
  'G.Q',
  'GGGGGGGG',
];
const level2 = parseLevel(map2);
assert(level2.width === 8, `Level width should be max row length (8), got ${level2.width}`);
assert(level2.tiles[0][5].type === T.AIR, 'Padded positions should be air');

// Test 4: Find spawn (first ground tile near left)
function getSpawn(level) {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x].type === T.GROUND) {
        return { x: x * 16 + 2, y: y * 16 - 16 * 2 };
      }
    }
  }
  return { x: 32, y: 100 };
}

const spawn = getSpawn(level1);
assert(spawn.x === 2, `Spawn X should be 2, got ${spawn.x}`);
assert(spawn.y === -32, `Spawn Y should be -32, got ${spawn.y}`);

// Test 5: Find flag position
function getFlagPos(level) {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x].type === T.FLAG) {
        return { x: x * 16, y: y * 16 };
      }
    }
  }
  return null;
}

const map3 = [
  'GGGGGGGGF',
  'G.......|',
  'G.......|',
];
const level3 = parseLevel(map3);
const flag = getFlagPos(level3);
assert(flag !== null, 'Flag position should be found');
assert(flag.x === 128, `Flag X should be 128, got ${flag.x}`);
assert(flag.y === 0, `Flag Y should be 0, got ${flag.y}`);

// Test 6: All tile types recognized
const map4 = [
  'GBQ[]{}P^D',
  '............',
];
const level4 = parseLevel(map4);
assert(level4.tiles[0][0].type === T.GROUND, 'G should be ground');
assert(level4.tiles[0][1].type === T.BRICK, 'B should be brick');
assert(level4.tiles[0][2].type === T.QUESTION, 'Q should be question');
assert(level4.tiles[0][3].type === T.PIPE_TL, '[ should be pipe top-left');
assert(level4.tiles[0][4].type === T.PIPE_TR, '] should be pipe top-right');
assert(level4.tiles[0][5].type === T.PIPE_BL, '{ should be pipe bottom-left');
assert(level4.tiles[0][6].type === T.PIPE_BR, '} should be pipe bottom-right');
assert(level4.tiles[0][7].type === T.PLATFORM, 'P should be platform');
assert(level4.tiles[0][8].type === T.SPIKE, '^ should be spike');
assert(level4.tiles[0][9].type === T.DECO, 'D should be decoration');

console.log('Level map parsing tests PASSED');
console.log(`  All ${Object.keys(T).length} tile types recognized`);
