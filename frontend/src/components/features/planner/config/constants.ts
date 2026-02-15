export const ENGINEERING_CONSTANTS = {
  WALL_THICKNESS: 10,
  OPENING_DEPTH: 18, // 10 + 8
  SCALE_FACTOR: 10,  // 1 unidad 3D = 10 mm
  CORNER_SAFETY_MARGIN: 5,
  ROOM_HEIGHT_DEFAULT: 2400, // mm
} as const;

export const ASSET_PATHS = {
  TEXTURES: {
    WOOD_OAK: '/textures/wood_oak.jpg',
  }
} as const;

export const COLORS = {
  WALL: {
    DEFAULT: 0xffffff,
    SELECTED: 0xd5a6bd,
    TECHNICAL: 0xe5e7eb,
  },
  UTILITIES: {
    ELEC: 0xffd700,
    WATER: 0x3b82f6,
    GAS: 0xef4444,
  }
} as const;