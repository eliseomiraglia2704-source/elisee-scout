/**
 * ELISEE WORLD — Map Loader (sez. 5 architettura)
 * Carica file mappa JSON e genera Tilemap ed Entity.
 */
(function (global) {
  'use strict';

  class MapLoader {
    static load(mapData) {
      const tilemap = new global.EliseeTilemap(mapData);
      const entities = [];

      if (mapData && mapData.npcs && Array.isArray(mapData.npcs)) {
        for (const n of mapData.npcs) {
          const npc = new global.EliseeNPC(n.x, n.y, n.name, n.dialogue, n.sprite);
          entities.push(npc);
        }
      }

      return {
        tilemap,
        entities,
        spawn: (mapData && mapData.spawn) || { x: 64, y: 64 }
      };
    }
  }

  global.EliseeMapLoader = MapLoader;
})(typeof window !== 'undefined' ? window : this);
