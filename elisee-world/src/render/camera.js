/**
 * ELISEE WORLD — CAMERA
 * Gestione viewport, player-follow e clamping ai bordi mappa.
 */
(function (global) {
  'use strict';

  function Camera(viewWidth, viewHeight) {
    this.x = 0;
    this.y = 0;
    this.width = viewWidth || 576;
    this.height = viewHeight || 480;
  }

  Camera.prototype.follow = function (targetX, targetY, mapWidthPx, mapHeightPx) {
    var rawX = targetX - this.width / 2;
    var rawY = targetY - this.height / 2;

    var maxX = Math.max(0, mapWidthPx - this.width);
    var maxY = Math.max(0, mapHeightPx - this.height);

    this.x = Math.max(0, Math.min(rawX, maxX));
    this.y = Math.max(0, Math.min(rawY, maxY));
  };

  Camera.prototype.apply = function (ctx) {
    ctx.save();
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  };

  Camera.prototype.restore = function (ctx) {
    ctx.restore();
  };

  global.EliseeCamera = Camera;

})(typeof window !== 'undefined' ? window : this);
