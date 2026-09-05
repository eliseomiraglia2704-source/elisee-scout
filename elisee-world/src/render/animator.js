/**
 * ELISEE WORLD — Animator (sez. 6 architettura)
 * State machine per animazioni frame-by-frame indipendenti dal framerate.
 */
(function (global) {
  'use strict';

  class Animator {
    constructor(clips) {
      this.clips = clips || {}; // { idle: { frames: [0], frameDuration: 200 } }
      this.current = Object.keys(this.clips)[0] || 'idle';
      this.time = 0;
      this.frameIndex = 0;
    }

    play(name) {
      if (this.current !== name && this.clips[name]) {
        this.current = name;
        this.time = 0;
        this.frameIndex = 0;
      }
    }

    update(dt) {
      const clip = this.clips[this.current];
      if (!clip || !clip.frames || !clip.frames.length) return;
      this.time += dt;
      const duration = clip.frameDuration || 150;
      this.frameIndex = Math.floor(this.time / duration) % clip.frames.length;
    }

    getCurrentFrame() {
      const clip = this.clips[this.current];
      if (!clip || !clip.frames) return 0;
      return clip.frames[this.frameIndex] ?? 0;
    }
  }

  global.EliseeAnimator = Animator;
})(typeof window !== 'undefined' ? window : this);
