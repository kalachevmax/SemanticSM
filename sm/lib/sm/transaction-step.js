

/**
 * @constructor
 * @param {!sm.StateMachine} stateMachine
 * @param {!sm.State} stateFrom
 * @param {!sm.State} stateTo
 */
sm.TransactionStep = function(stateMachine, stateFrom, stateTo) {
  /**
   * @type {!sm.StateMachine}
   */
  this.stateMachine = stateMachine;

  /**
   * @type {!sm.State}
   */
  this.stateFrom = stateFrom;

  /**
   * @type {!sm.State}
   */
  this.stateTo = stateTo;
};
