/**
 * ELISEE WORLD — Asset Loader (sez. 10 architettura)
 * Preloader manifest-based con progress bar e cache in memoria.
 */
(function (global) {
  'use strict';

  class AssetLoader {
    constructor() {
      this.images = new Map();
      this.json = new Map();
      this.audioBuffers = new Map();
      this.totalAssets = 0;
      this.loadedAssets = 0;
    }

    async loadManifest(manifestUrl, onProgress) {
      try {
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error('Impossibile caricare manifest: ' + manifestUrl);
        const manifest = await res.json();
        return await this.loadAll(manifest, onProgress);
      } catch (err) {
        console.warn('[AssetLoader] Fallback manifest inline:', err);
        return await this.loadAll({ json: [], images: [], audio: [] }, onProgress);
      }
    }

    async loadAll(manifest, onProgress) {
      const jsonList = manifest.json || [];
      const imageList = manifest.images || [];
      const audioList = manifest.audio || [];

      this.totalAssets = jsonList.length + imageList.length + audioList.length;
      this.loadedAssets = 0;

      const reportProgress = () => {
        this.loadedAssets++;
        const percent = this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 1;
        if (typeof onProgress === 'function') onProgress(percent);
      };

      const jsonPromises = jsonList.map(async (item) => {
        try {
          const r = await fetch(item.url);
          const data = await r.json();
          this.json.set(item.id, data);
        } catch (e) {
          console.warn('[AssetLoader] JSON non caricato:', item.id, e);
          this.json.set(item.id, null);
        }
        reportProgress();
      });

      const imagePromises = imageList.map((item) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.images.set(item.id, img);
            reportProgress();
            resolve();
          };
          img.onerror = () => {
            console.warn('[AssetLoader] Immagine non caricata:', item.id);
            this.images.set(item.id, null);
            reportProgress();
            resolve();
          };
          img.src = item.url;
        });
      });

      await Promise.all([...jsonPromises, ...imagePromises]);
      return true;
    }

    getJSON(id) {
      return this.json.get(id) || null;
    }

    getImage(id) {
      return this.images.get(id) || null;
    }
  }

  global.EliseeAssetLoader = AssetLoader;
})(typeof window !== 'undefined' ? window : this);
