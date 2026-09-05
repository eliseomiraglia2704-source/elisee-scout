/**
 * ELISEE WORLD — TILEMAP & WORLD GENERATOR
 * Mappa top-down retro 32x32px con città, edifici (ELIMART, Stadio, Edicola),
 * campo di allenamento, erba per scouting selvatico e collisioni O(1).
 */
(function (global) {
  'use strict';

  var TILE_SIZE = 32;
  var COLS = 30;
  var ROWS = 24;

  // TILE IDS:
  // 0: GRASS, 1: PATH, 2: WATER, 3: TALL_GRASS (wild encounters),
  // 4: WALL/TREE, 5: BUILDING_WALL, 6: BUILDING_ROOF, 7: DOOR
  var collisionGrid = [];
  var groundGrid = [];

  function initMap() {
    collisionGrid = [];
    groundGrid = [];

    for (var y = 0; y < ROWS; y++) {
      groundGrid[y] = [];
      collisionGrid[y] = [];
      for (var x = 0; x < COLS; x++) {
        // Bordi esterni = alberi/muri solidi
        if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
          groundGrid[y][x] = 4; // Albero solido
          collisionGrid[y][x] = 1;
        } else {
          groundGrid[y][x] = 0; // Prato standard
          collisionGrid[y][x] = 0;
        }
      }
    }

    // Strade principali
    for (var x = 1; x < COLS - 1; x++) {
      groundGrid[10][x] = 1; // Strada orizzontale
      groundGrid[11][x] = 1;
    }
    for (var y = 1; y < ROWS - 1; y++) {
      groundGrid[y][14] = 1; // Strada verticale
      groundGrid[y][15] = 1;
    }

    // Edificio 1: ELIMART (Negozio) in alto a sinistra (x: 3-7, y: 3-6)
    addBuilding(3, 3, 5, 4, 'ELIMART', '#0284c7');

    // Edificio 2: STADIO CENTRALE in alto a destra (x: 20-26, y: 2-7)
    addBuilding(20, 2, 7, 5, 'STADIO CENTRALE', '#22c55e');

    // Edificio 3: EDICOLA GUAZZETTA (x: 4-7, y: 14-17)
    addBuilding(4, 14, 4, 3, 'EDICOLA', '#f59e0b');

    // Zona Erba Alta / Scouting in basso a destra (x: 18-27, y: 13-21)
    for (var gy = 13; gy <= 21; gy++) {
      for (var gx = 18; gx <= 27; gx++) {
        groundGrid[gy][gx] = 3; // Erba alta
      }
    }

    // Laghetto decorativo (x: 8-11, y: 18-21)
    for (var wy = 18; wy <= 21; wy++) {
      for (var wx = 8; wx <= 11; wx++) {
        groundGrid[wy][wx] = 2;
        collisionGrid[wy][wx] = 1; // Acqua solida
      }
    }
  }

  var buildings = [];

  function addBuilding(startX, startY, width, height, label, color) {
    buildings.push({
      x: startX * TILE_SIZE,
      y: startY * TILE_SIZE,
      w: width * TILE_SIZE,
      h: height * TILE_SIZE,
      label: label,
      color: color
    });

    for (var by = startY; by < startY + height; by++) {
      for (var bx = startX; bx < startX + width; bx++) {
        groundGrid[by][bx] = 5;
        // Porta accessibile in basso al centro
        if (by === startY + height - 1 && bx === startX + Math.floor(width / 2)) {
          collisionGrid[by][bx] = 0; // Porta camminabile
          groundGrid[by][bx] = 7;
        } else {
          collisionGrid[by][bx] = 1; // Muro solido
        }
      }
    }
  }

  initMap();

  var Tilemap = {
    TILE_SIZE: TILE_SIZE,
    COLS: COLS,
    ROWS: ROWS,
    widthPx: COLS * TILE_SIZE,
    heightPx: ROWS * TILE_SIZE,

    isSolid: function (xPx, yPx) {
      var gx = Math.floor(xPx / TILE_SIZE);
      var gy = Math.floor(yPx / TILE_SIZE);
      if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return true;
      return collisionGrid[gy][gx] === 1;
    },

    isTallGrass: function (xPx, yPx) {
      var gx = Math.floor(xPx / TILE_SIZE);
      var gy = Math.floor(yPx / TILE_SIZE);
      if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return false;
      return groundGrid[gy][gx] === 3;
    },

    render: function (ctx, camera) {
      var startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE));
      var endCol = Math.min(COLS, Math.ceil((camera.x + camera.width) / TILE_SIZE) + 1);
      var startRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
      var endRow = Math.min(ROWS, Math.ceil((camera.y + camera.height) / TILE_SIZE) + 1);

      for (var y = startRow; y < endRow; y++) {
        for (var x = startCol; x < endCol; x++) {
          var tile = groundGrid[y][x];
          var px = x * TILE_SIZE;
          var py = y * TILE_SIZE;

          switch (tile) {
            case 0: // Grass
              ctx.fillStyle = '#1e3a1e';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              // Piccoli dettagli d'erba
              if ((x + y) % 3 === 0) {
                ctx.fillStyle = '#2d5a2d';
                ctx.fillRect(px + 6, py + 8, 3, 6);
                ctx.fillRect(px + 18, py + 16, 3, 6);
              }
              break;
            case 1: // Path / Strada
              ctx.fillStyle = '#475569';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#64748b';
              ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
              break;
            case 2: // Water
              ctx.fillStyle = '#0284c7';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#38bdf8';
              ctx.fillRect(px + 4, py + 12, 12, 3);
              break;
            case 3: // Tall grass
              ctx.fillStyle = '#166534';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(px + 4, py + 4, 4, 14);
              ctx.fillRect(px + 12, py + 8, 4, 16);
              ctx.fillRect(px + 20, py + 2, 4, 18);
              break;
            case 4: // Tree border
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = '#14532d';
              ctx.beginPath();
              ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 14, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#16a34a';
              ctx.beginPath();
              ctx.arc(px + TILE_SIZE / 2 - 2, py + TILE_SIZE / 2 - 2, 8, 0, Math.PI * 2);
              ctx.fill();
              break;
            default:
              ctx.fillStyle = '#1e293b';
              ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
              break;
          }
        }
      }

      // Disegna edifici
      for (var b = 0; b < buildings.length; b++) {
        var bldg = buildings[b];
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(bldg.x, bldg.y, bldg.w, bldg.h);
        ctx.strokeStyle = bldg.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(bldg.x, bldg.y, bldg.w, bldg.h);

        // Tetto
        ctx.fillStyle = bldg.color;
        ctx.fillRect(bldg.x, bldg.y, bldg.w, 18);

        // Insegna edificio
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Outfit", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(bldg.label, bldg.x + bldg.w / 2, bldg.y + 13);
        ctx.textAlign = 'start';

        // Porta
        var doorX = bldg.x + bldg.w / 2 - 12;
        var doorY = bldg.y + bldg.h - 24;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(doorX, doorY, 24, 24);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(doorX, doorY, 24, 24);
      }
    }
  };

  global.EliseeTilemap = Tilemap;

})(typeof window !== 'undefined' ? window : this);
