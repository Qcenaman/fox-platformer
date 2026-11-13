// Constants and palette
const W = 256, H = 240, TILE = 16, FPS = 60, FRAME = 1000 / FPS;
const COLS = W / TILE, ROWS = H / TILE;

// Palette (24 colors)
const PAL = {
  _0:'#0f0f1f',_1:'#f8f8f8',_2:'#a06818',_3:'#e8c878',
  _4:'#58a858',_5:'#385838',_6:'#f8d848',_7:'#e84828',
  _8:'#5888d8',_9:'#3838a8',_a:'#d8a0d0',_b:'#d0d0d0',
  _c:'#808080',_d:'#a8d8a8',_e:'#f8a058',_f:'#d8e8f8',
  _g:'#684828',_h:'#c84848',_i:'#68c8e8',_j:'#484848',
  _k:'#e8a0a0',_l:'#88c848',_m:'#f8e8c8',_n:'#e888c8',
};

// Tile characters
const T = {
  AIR:'.',GROUND:'G',BRICK:'B',QUESTION:'Q',PIPE_TL:'[',PIPE_TR:']',
  PIPE_BL:'{',PIPE_BR:'}',PLATFORM:'P',FLAG:'F',FLAG_POLE:'|',
  USED:'U',DECO:'D',SPIKE:'^',
};

// Input keys
const KEY = {
  LEFT:'left',RIGHT:'right',UP:'up',DOWN:'down',
  JUMP:'jump',RUN:'run',PAUSE:'pause',
};

// Game states
const STATE = {
  TITLE:0,PLAYING:1,PAUSED:2,LEVEL_COMPLETE:3,
  GAME_OVER:4,TRANSITION:5,
};

export { W, H, TILE, FPS, FRAME, COLS, ROWS, PAL, T, KEY, STATE };
