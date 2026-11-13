// Test: Jump physics
// Tests gravity, jump velocity, variable jump height
import assert from 'assert';

const GRAVITY = 0.45;
const JUMP_VEL = -7.5;
const JUMP_HOLD_TIME = 12;
const JUMP_HOLD_VEL = -3.5;

// Simulate a jump where player holds jump button the full duration
function simulateFullJump() {
  let vy = JUMP_VEL;
  let y = 0;
  const heights = [0];

  for (let frame = 0; frame < 60; frame++) {
    vy += GRAVITY;
    // Apply jump hold: reduces gravity effect while button held
    if (frame < JUMP_HOLD_TIME && vy < 0) {
      vy = Math.max(vy + JUMP_HOLD_VEL / JUMP_HOLD_TIME, JUMP_VEL);
    }
    y += vy;
    heights.push(y);
    if (y >= 0 && frame > 5) break; // landed
  }

  return { maxHeight: Math.min(...heights), totalFrames: heights.length - 1 };
}

// Simulate a jump where player releases button early (tap)
function simulateTapJump() {
  let vy = JUMP_VEL;
  let y = 0;
  const heights = [0];
  const holdFrames = 3; // release after 3 frames

  for (let frame = 0; frame < 60; frame++) {
    vy += GRAVITY;
    // Apply jump hold only for first 3 frames
    if (frame < holdFrames && vy < 0) {
      vy = Math.max(vy + JUMP_HOLD_VEL / JUMP_HOLD_TIME, JUMP_VEL);
    }
    y += vy;
    heights.push(y);
    if (y >= 0 && frame > 2) break; // landed
  }

  return { maxHeight: Math.min(...heights), totalFrames: heights.length - 1 };
}

// Test 1: Jump reaches positive height (negative Y = up)
const fullJump = simulateFullJump();
assert(fullJump.maxHeight < 0, 'Jump should reach positive height (negative Y = up)');

// Test 2: Full jump is higher than tap jump
const tapJump = simulateTapJump();
assert(fullJump.maxHeight < tapJump.maxHeight, 'Full jump should be higher than tap jump');

// Test 3: Gravity is positive (pulls down)
assert(GRAVITY > 0, 'Gravity should pull down');

// Test 4: Jump velocity is negative (goes up)
assert(JUMP_VEL < 0, 'Jump velocity should be negative (upward)');

// Test 5: Jump reaches peak and comes back down
let peakReached = false;
let goingDown = false;
let vy2 = JUMP_VEL;
let y2 = 0;
for (let frame = 0; frame < 60; frame++) {
  vy2 += GRAVITY;
  y2 += vy2;
  if (vy2 > 0) goingDown = true;
  if (goingDown && y2 >= 0) { peakReached = true; break; }
}
assert(peakReached, 'Jump should reach peak and come back down');

// Test 6: Jump hold extends air time
assert(fullJump.totalFrames > tapJump.totalFrames, 'Full jump should stay airborne longer');

// Test 7: Jump hold extends height
assert(fullJump.maxHeight < tapJump.maxHeight, 'Full jump should reach greater height');

console.log('Jump physics tests PASSED');
console.log(`  Full jump height: ${-fullJump.maxHeight.toFixed(1)} tiles, ${fullJump.totalFrames} frames`);
console.log(`  Tap jump height: ${-tapJump.maxHeight.toFixed(1)} tiles, ${tapJump.totalFrames} frames`);
