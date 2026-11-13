// Test: Stomp vs side-hit enemy collision
// Tests the logic for determining whether player stomps enemy or gets hit
import assert from 'assert';

const ENEMY_W = 16, ENEMY_H = 16;
const SMALL_W = 14, SMALL_H = 16;
const BIG_W = 14, BIG_H = 30;

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Test 1: Stomp from above - player falling, overlapping enemy, player bottom near enemy top
function testStomp() {
  const player = { x: 32, y: 126, w: SMALL_W, h: SMALL_H, vy: 3 }; // falling, overlaps enemy
  const enemy = { x: 32, y: 140, w: ENEMY_W, h: ENEMY_H };

  const playerBottom = player.y + player.h; // 142
  const enemyTop = enemy.y; // 140
  const playerAbove = playerBottom - enemyTop < 10 && player.vy > 0;

  assert(rectsOverlap(player, enemy), 'Player and enemy should overlap');
  assert(playerAbove, 'Player should be above enemy and falling (stomp)');
}

// Test 2: Side hit - player moving horizontally into enemy
function testSideHit() {
  const player = { x: 52, y: 128, w: SMALL_W, h: SMALL_H, vx: 2, vy: 0 }; // moving right, overlaps enemy
  const enemy = { x: 64, y: 128, w: ENEMY_W, h: ENEMY_H };

  const playerBottom = player.y + player.h; // 144
  const enemyTop = enemy.y; // 128
  const playerAbove = playerBottom - enemyTop < 10 && player.vy > 0;

  assert(rectsOverlap(player, enemy), 'Player and enemy should overlap');
  assert(!playerAbove, 'Player should NOT be above enemy (side hit)');
}

// Test 3: Player completely above enemy (no collision)
function testNoOverlap() {
  const player = { x: 32, y: 80, w: SMALL_W, h: SMALL_H, vy: -1 }; // above
  const enemy = { x: 32, y: 140, w: ENEMY_W, h: ENEMY_H };

  assert(!rectsOverlap(player, enemy), 'Player above enemy should not overlap');
}

// Test 4: Big player stomp
function testBigStomp() {
  const player = { x: 32, y: 112, w: BIG_W, h: BIG_H, vy: 3 }; // big player falling
  const enemy = { x: 32, y: 140, w: ENEMY_W, h: ENEMY_H };

  const playerBottom = player.y + player.h; // 142
  const enemyTop = enemy.y; // 140
  const playerAbove = playerBottom - enemyTop < 10 && player.vy > 0;

  assert(rectsOverlap(player, enemy), 'Big player and enemy should overlap');
  assert(playerAbove, 'Big player should be above enemy (stomp)');
}

// Test 5: Player slightly above enemy but NOT falling (standing on same level)
function testStandingNotStomp() {
  const player = { x: 32, y: 124, w: SMALL_W, h: SMALL_H, vy: 0 }; // overlapping
  const enemy = { x: 32, y: 140, w: ENEMY_W, h: ENEMY_H };

  const playerBottom = player.y + player.h; // 140
  const enemyTop = enemy.y; // 140
  const playerAbove = playerBottom - enemyTop < 10 && player.vy > 0;

  assert(!playerAbove, 'Standing player should not be considered stomping (vy is 0)');
}

// Test 6: Player falling from far above (stomp still works)
function testFarStomp() {
  const player = { x: 32, y: 126, w: SMALL_W, h: SMALL_H, vy: 7 }; // fast, overlapping
  const enemy = { x: 32, y: 140, w: ENEMY_W, h: ENEMY_H };

  const overlap = rectsOverlap(player, enemy);
  assert(overlap, 'Fast falling player should overlap enemy');
  const playerAbove = (player.y + player.h) - enemy.y < 10 && player.vy > 0;
  assert(playerAbove, 'Fast falling player should stomp');
}

testStomp();
testSideHit();
testNoOverlap();
testBigStomp();
testStandingNotStomp();
testFarStomp();

console.log('Stomp vs side-hit tests PASSED');
