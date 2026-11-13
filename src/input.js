// Input handling: keyboard, gamepad, touch
import { KEY } from './constants.js';

const keys = {};
let gamepadIndex = null;

function setupKeyboard() {
  window.addEventListener('keydown', e => {
    const map = {
      ArrowLeft: KEY.LEFT, ArrowRight: KEY.RIGHT, ArrowUp: KEY.UP, ArrowDown: KEY.DOWN,
      a: KEY.LEFT, d: KEY.RIGHT, w: KEY.UP, s: KEY.DOWN,
      A: KEY.LEFT, D: KEY.RIGHT, W: KEY.UP, S: KEY.DOWN,
      ' ': KEY.JUMP, z: KEY.JUMP, Z: KEY.JUMP,
      Shift: KEY.RUN, x: KEY.RUN, X: KEY.RUN,
      Enter: KEY.PAUSE, Escape: KEY.PAUSE,
    };
    if (map[e.key] !== undefined) {
      keys[map[e.key]] = true;
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    const map = {
      ArrowLeft: KEY.LEFT, ArrowRight: KEY.RIGHT, ArrowUp: KEY.UP, ArrowDown: KEY.DOWN,
      a: KEY.LEFT, d: KEY.RIGHT, w: KEY.UP, s: KEY.DOWN,
      A: KEY.LEFT, D: KEY.RIGHT, W: KEY.UP, S: KEY.DOWN,
      ' ': KEY.JUMP, z: KEY.JUMP, Z: KEY.JUMP,
      Shift: KEY.RUN, x: KEY.RUN, X: KEY.RUN,
      Enter: KEY.PAUSE, Escape: KEY.PAUSE,
    };
    if (map[e.key] !== undefined) {
      keys[map[e.key]] = false;
      e.preventDefault();
    }
  });
}

function setupTouch() {
  const btns = {
    'btn-left': KEY.LEFT, 'btn-right': KEY.RIGHT, 'btn-up': KEY.UP,
    'btn-jump': KEY.JUMP, 'btn-run': KEY.RUN,
  };
  for (const [id, key] of Object.entries(btns)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('touchstart', e => { e.preventDefault(); keys[key] = true; });
    el.addEventListener('touchend', e => { e.preventDefault(); keys[key] = false; });
    el.addEventListener('touchcancel', e => { keys[key] = false; });
  }
}

function pollGamepad() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let i = 0; i < gps.length; i++) {
    if (gps[i]) {
      gamepadIndex = i;
      const gp = gps[i];
      // D-pad and left stick
      keys[KEY.LEFT] = gp.axes[0] < -0.5 || gp.buttons[14]?.pressed;
      keys[KEY.RIGHT] = gp.axes[0] > 0.5 || gp.buttons[15]?.pressed;
      keys[KEY.UP] = gp.axes[1] < -0.5 || gp.buttons[12]?.pressed;
      keys[KEY.DOWN] = gp.axes[1] > 0.5 || gp.buttons[13]?.pressed;
      // A=X=jump, B=Circle=jump, Y=Triangle=run
      keys[KEY.JUMP] = gp.buttons[0]?.pressed || gp.buttons[2]?.pressed || gp.buttons[1]?.pressed || gp.buttons[3]?.pressed;
      keys[KEY.RUN] = gp.buttons[4]?.pressed || gp.buttons[5]?.pressed;
      // Start=pause, Select
      keys[KEY.PAUSE] = gp.buttons[9]?.pressed || gp.buttons[8]?.pressed;
      break;
    }
  }
}

function isDown(k) { return !!keys[k]; }

function setup() {
  setupKeyboard();
  setupTouch();
}

export { isDown, pollGamepad, setup };
