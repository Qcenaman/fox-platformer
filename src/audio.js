// Audio: Web Audio API chiptune sounds and background music
let audioCtx = null;
let masterGain = null;
let musicPlaying = false;
let musicNodes = [];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
}

function playTone(freq, duration, type = 'square', vol = 0.3) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playNoise(duration, vol = 0.2) {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  source.connect(gain);
  gain.connect(masterGain);
  source.start();
}

// Sound effects
function sfxJump() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.15);
  gain.gain.value = 0.2;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.15);
}

function sfxCoin() {
  playTone(988, 0.08, 'square', 0.2);
  setTimeout(() => playTone(1319, 0.15, 'square', 0.2), 80);
}

function sfxStomp() {
  playTone(200, 0.1, 'square', 0.25);
  setTimeout(() => playNoise(0.05, 0.15), 50);
}

function sfxPowerUp() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.12, 'square', 0.2), i * 80);
  });
}

function sfxDeath() {
  const notes = [400, 350, 300, 250, 200, 150];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.15, 'square', 0.25), i * 100);
  });
}

function sfxBump() {
  playTone(150, 0.08, 'square', 0.2);
}

function sfxBreak() {
  playNoise(0.1, 0.3);
  playTone(300, 0.05, 'square', 0.15);
}

function sfx1UP() {
  const notes = [262, 330, 392, 523, 392, 523];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(n, 0.1, 'square', 0.2), i * 60);
  });
}

// Background music (simple looping tune)
function startMusic() {
  if (!audioCtx || musicPlaying) return;
  musicPlaying = true;

  // Simple melody loop (C major pentatonic-ish)
  const melody = [
    523, 0, 659, 0, 784, 0, 659, 0,
    587, 0, 698, 0, 880, 0, 698, 0,
    523, 0, 784, 0, 659, 0, 523, 0,
    440, 0, 523, 0, 587, 0, 659, 0,
  ];
  const bass = [
    131, 0, 0, 0, 165, 0, 0, 0,
    147, 0, 0, 0, 175, 0, 0, 0,
    131, 0, 0, 0, 165, 0, 0, 0,
    110, 0, 0, 0, 131, 0, 0, 0,
  ];

  function playNote(seq, freq, time, dur) {
    if (freq === 0) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = seq === melody ? 'square' : 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + dur);
  }

  const bpm = 150;
  const beatDur = 60 / bpm;
  const loopDur = melody.length * beatDur * 0.5;

  function scheduleLoop() {
    if (!musicPlaying) return;
    const now = audioCtx.currentTime;
    for (let i = 0; i < melody.length; i++) {
      const t = now + i * beatDur * 0.5;
      playNote(melody, melody[i], t, beatDur * 0.4);
      playNote(bass, bass[i], t, beatDur * 0.4);
    }
    musicNodes.push(setTimeout(scheduleLoop, loopDur * 1000 - 100));
  }
  scheduleLoop();
}

function stopMusic() {
  musicPlaying = false;
  musicNodes.forEach(id => clearTimeout(id));
  musicNodes = [];
}

export { initAudio, startMusic, stopMusic, sfxJump, sfxCoin, sfxStomp, sfxPowerUp, sfxDeath, sfxBump, sfxBreak, sfx1UP };
