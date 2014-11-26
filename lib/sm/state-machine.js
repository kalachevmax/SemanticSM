

/**
 * @constructor
 * @extends {events.EventEmitter}
 * @param {!Array.<sm.TransitionDefinition>} transitionDefinitions
 * @param {!sm.StateMachine=} opt_propagationParent
 */
sm.StateMachine = function(transitionDefinitions, opt_propagationParent) {
  events.EventEmitter.call(this, opt_propagationParent);

  /**
   * @type {sm.TransitionsGraph}
   */
  this.__transitions = sm.makeTransitionsGraph(transitionDefinitions);

  /**
   * @type {!sm.State}
   */
  this.__state = sm.State.NULL;

  /**
   * @type {!Array.<!sm.StateMachine>}
   */
  this.__childs = [];
};


/**
 * @return {!sm.State}
 */
sm.StateMachine.prototype.getState = function() {
  return this.__state;
};


/**
 * @param {!sm.State} state
 */
sm.StateMachine.prototype.setState = function(state) {
  this.__state = state;
};


/**
 * @return {sm.TransitionFrom}
 */
sm.StateMachine.prototype.getTransitions = function() {
  return this.__transitions;
};


/**
 * @param {!sm.State} stateTo
 * @return {!sm.Transition}
 */
sm.StateMachine.prototype.getTransition = function(stateTo) {
  return this.__transitions[this.__state['eventType']][stateTo['eventType']];
};


/**
 * @param {!sm.StateMachine} child
 */
sm.StateMachine.prototype.addChild = function(child) {
  if (!this.hasChild(child)) {
    this.__childs.push(child);
  }
};


/**
 * @param {!sm.StateMachine} child
 */
sm.StateMachine.prototype.removeChild = function(child) {
  var index = utils.indexOf(child, this.__childs);

  if (index !== -1) {
    this.__childs.splice(index, 1);
  }
};


/**
 * @param {!sm.StateMachine} child
 */
sm.StateMachine.prototype.removeAllChildren = function(child) {
  this.__childs = [];
};


/**
 * @param {!sm.StateMachine} child
 */
sm.StateMachine.prototype.hasChild = function(child) {
  return utils.indexOf(child, this.__childs) !== -1;
};


/**
 * @return {!Array.<!sm.StateMachine>}
 */
sm.StateMachine.prototype.getChildren = function() {
  return this.__childs;
};
