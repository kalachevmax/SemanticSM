

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
   * @type {!Object.<sm.ActionFlag, fm.Action>}
   */
  this.__checkActions = {};

  /**
   * @type {!Object.<sm.ActionFlag, fm.Action>}
   */
  this.__transitActions = {};

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
 * @return {sm.TransitionsGraph}
 */
sm.StateMachine.prototype.getTransitions = function() {
  return this.__transitions;
};


/**
 * @param {!sm.State} stateTo
 * @return {!sm.ActionFlag}
 */
sm.StateMachine.prototype.getTransition = function(stateTo) {
  return this.__transitions[this.__state][stateTo];
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


/**
 * @param {!Object.<string, *>} states
 * @param {!sm.State} targetState
 * @return {sm.State}
 */
sm.StateMachine.prototype.__findSubState = function(states, targetState) {
  for (var state in states) {
    if (state.indexOf(targetState) === 0) {
      return state;
    }
  }

  return null;
};


/**
 * @param {!sm.State} state
 * @return {sm.ActionFlag}
 */
sm.StateMachine.prototype.__findActionFlagForSubState = function(state) {
  var fromState = this.__findSubState(this.__transitions, this.getState());

  if (fromState !== null) {
    var toState = this.__findSubState(this.__transitions[fromState], state);

    if (toState !== null) {
      return this.__transitions[fromState][toState];
    }
  }

  return -1;
};


/**
 * @param {sm.ActionFlag} flag
 * @param {fm.Action} checkAction
 * @param {fm.Action} transitAction
 */
sm.StateMachine.prototype.registerAction = function(flag, checkAction, transitAction) {
  if (typeof this.__checkActions[flag] === 'undefined') {
    this.__checkActions[flag] = checkAction;
    this.__transitActions[flag] = transitAction;
  }
};
