// Camera: follows player, never scrolls backwards
import { W } from './constants.js';

function createCamera() {
  return { x: 0, y: 0 };
}

function updateCamera(camera, player, levelWidth) {
  // Target position (center player, but keep within bounds)
  const targetX = player.x - W / 2 + player.w / 2;

  // Only scroll forward
  if (targetX > camera.x) {
    camera.x = targetX;
  }

  // Clamp to level bounds
  const maxX = Math.max(0, levelWidth - W);
  if (camera.x > maxX) camera.x = maxX;
  if (camera.x < 0) camera.x = 0;
}

export { createCamera, updateCamera };
