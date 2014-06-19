

/**
 * @constructor
 * @param {!just.sm.StateMachine} stateMachine
 * @param {!just.sm.State} stateFrom
 * @param {!just.sm.State} stateTo
 */
just.sm.TransactionStep = function(stateMachine, stateFrom, stateTo) {
  /**
   * @type {!just.sm.StateMachine}
   */
  this.stateMachine = stateMachine;

  /**
   * @type {!just.sm.State}
   */
  this.stateFrom = stateFrom;

  /**
   * @type {!just.sm.State}
   */
  this.stateTo = stateTo;
};
