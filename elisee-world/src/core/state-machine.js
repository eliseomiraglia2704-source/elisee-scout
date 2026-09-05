/**
 * ELISEE WORLD — GENERIC STATE MACHINE
 * Gestore stati riusabile per loop globale, schermate e battaglia.
 */
(function (global) {
  'use strict';

  function StateMachine(states, initial) {
    this.states = states || {};
    this.current = initial || null;
    if (initial && this.states[initial] && typeof this.states[initial].enter === 'function') {
      this.states[initial].enter();
    }
  }

  StateMachine.prototype.transition = function (name, payload) {
    if (!this.states[name]) {
      console.warn('[EliseeStateMachine] Stato non trovato:', name);
      return;
    }
    if (this.current && this.states[this.current] && typeof this.states[this.current].exit === 'function') {
      this.states[this.current].exit();
    }
    var previous = this.current;
    this.current = name;
    if (typeof this.states[name].enter === 'function') {
      this.states[name].enter(payload, previous);
    }
  };

  StateMachine.prototype.update = function (dt) {
    if (this.current && this.states[this.current] && typeof this.states[this.current].update === 'function') {
      this.states[this.current].update(dt);
    }
  };

  StateMachine.prototype.render = function (ctx) {
    if (this.current && this.states[this.current] && typeof this.states[this.current].render === 'function') {
      this.states[this.current].render(ctx);
    }
  };

  global.EliseeStateMachine = StateMachine;

})(typeof window !== 'undefined' ? window : this);
