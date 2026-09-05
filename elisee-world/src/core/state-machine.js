/**
 * ELISEE WORLD — State Machine generica riusabile
 * Conforme a sez. 3 dell'architettura del motore grafico.
 */
(function (global) {
  'use strict';

  class StateMachine {
    constructor(states, initial) {
      this.states = states || {}; // { NOME: { enter(payload), update(dt), render(ctx, renderer), exit() } }
      this.current = initial || null;
      if (this.current && this.states[this.current] && typeof this.states[this.current].enter === 'function') {
        this.states[this.current].enter();
      }
    }

    transition(name, payload) {
      if (this.current && this.states[this.current] && typeof this.states[this.current].exit === 'function') {
        this.states[this.current].exit();
      }
      this.current = name;
      if (this.states[name] && typeof this.states[name].enter === 'function') {
        this.states[name].enter(payload);
      }
    }

    update(dt) {
      if (this.current && this.states[this.current] && typeof this.states[this.current].update === 'function') {
        this.states[this.current].update(dt);
      }
    }

    render(ctx, renderer) {
      if (this.current && this.states[this.current] && typeof this.states[this.current].render === 'function') {
        this.states[this.current].render(ctx, renderer);
      }
    }

    getCurrent() {
      return this.current;
    }
  }

  global.EliseeStateMachine = StateMachine;
})(typeof window !== 'undefined' ? window : this);
