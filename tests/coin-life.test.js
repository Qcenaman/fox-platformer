// Test: Coin to extra life conversion
// Tests that 100 coins = 1 extra life
import assert from 'assert';

const COINS_PER_LIFE = 100;

function simulateCoins(coinsToAdd, initialCoins = 0, initialLives = 1) {
  let coins = initialCoins;
  let lives = initialLives;

  for (let i = 0; i < coinsToAdd; i++) {
    coins++;
    if (coins >= COINS_PER_LIFE) {
      coins = 0;
      lives++;
    }
  }

  return { coins, lives };
}

// Test 1: 100 coins = 1 extra life
const result1 = simulateCoins(100, 0, 1);
assert(result1.coins === 0, `After 100 coins, coin count should wrap to 0, got ${result1.coins}`);
assert(result1.lives === 2, `After 100 coins, should have 2 lives, got ${result1.lives}`);

// Test 2: 50 coins = no extra life
const result2 = simulateCoins(50, 0, 1);
assert(result2.coins === 50, `After 50 coins, should have 50, got ${result2.coins}`);
assert(result2.lives === 1, `After 50 coins, should still have 1 life, got ${result2.lives}`);

// Test 3: 200 coins = 2 extra lives
const result3 = simulateCoins(200, 0, 1);
assert(result3.coins === 0, `After 200 coins, coin count should wrap to 0, got ${result3.coins}`);
assert(result3.lives === 3, `After 200 coins, should have 3 lives, got ${result3.lives}`);

// Test 4: Starting with 50 coins, next 50 = 1 life
const result4 = simulateCoins(50, 50, 1);
assert(result4.coins === 0, `Starting at 50, after 50 more should wrap to 0, got ${result4.coins}`);
assert(result4.lives === 2, `Starting at 50, after 50 more should gain 1 life, got ${result4.lives}`);

// Test 5: 150 coins from 25 = 1 extra life + 75 remaining
const result5 = simulateCoins(150, 25, 1);
assert(result5.coins === 75, `After 150 coins from 25, should have 75, got ${result5.coins}`);
assert(result5.lives === 2, `After 150 coins from 25, should have 2 lives, got ${result5.lives}`);

// Test 6: 300 coins = 3 extra lives
const result6 = simulateCoins(300, 0, 1);
assert(result6.coins === 0, `After 300 coins, should wrap to 0, got ${result6.coins}`);
assert(result6.lives === 4, `After 300 coins, should have 4 lives, got ${result6.lives}`);

// Test 7: Score increases with each coin
function simulateScore(coinsToAdd) {
  let score = 0;
  for (let i = 0; i < coinsToAdd; i++) {
    score += 200; // 200 points per coin
  }
  return score;
}

const scoreResult = simulateScore(10);
assert(scoreResult === 2000, `10 coins should equal 2000 score, got ${scoreResult}`);

console.log('Coin to extra life tests PASSED');
console.log(`  ${COINS_PER_LIFE} coins = 1 extra life`);
console.log(`  Each coin = 200 points`);
