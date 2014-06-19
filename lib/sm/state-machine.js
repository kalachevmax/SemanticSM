

/**
 * @constructor
 * @extends {just.events.EventEmitter}
 * @param {!Array.<just.sm.TransitionDefinition>} transitions
 * @param {!just.sm.StateMachine=} opt_propagationParent
 */
just.sm.StateMachine = function(transitions, opt_propagationParent) {
  just.events.EventEmitter.call(this, opt_propagationParent);

  /**
   * @type {just.sm.TransitionFrom}
   */
  this.__transitions = this.__transform(transitions);

  /**
   * @type {!just.sm.State}
   */
  this.__state = just.sm.State.NULL;

  /**
   * @type {!Array.<!just.sm.StateMachine>}
   */
  this.__childs = [];
};


/**
 * @param {!Array.<just.sm.TransitionDefinition>} transitions
 * @return {just.sm.TransitionFrom}
 */
just.sm.StateMachijust.prototype.__transform = function(transitions) {
  var result = {};

  var i = 0,
      l = transitions.length;

  while (i < l) {
    var transition = transitions[i];
    var fromEvent = transition[0];
    var toEvent = transition[1];
    var check = transition[2];
    var script = transition[3];

    if (typeof result[fromEvent] === 'undefined') {
      result[fromEvent] = {};
    }

    if (typeof result[fromEvent][toEvent] === 'undefined') {
      result[fromEvent][toEvent] = just.sm.createTransition(check, script);
    }

    i += 1;
  }

  return result;
};


/**
 * @return {!just.sm.State}
 */
just.sm.StateMachijust.prototype.getState = function() {
  return this.__state;
};


/**
 * @param {!just.sm.State} state
 */
just.sm.StateMachijust.prototype.setState = function(state) {
  this.__state = state;
};


/**
 * @return {just.sm.TransitionFrom}
 */
just.sm.StateMachijust.prototype.getTransitions = function() {
  return this.__transitions;
};


/**
 * @param {!just.sm.State} stateTo
 * @return {!just.sm.Transition}
 */
just.sm.StateMachijust.prototype.getTransition = function(stateTo) {
  return this.__transitions[this.__state['eventType']][stateTo['eventType']];
};


/**
 * @param {!just.sm.StateMachine} child
 */
just.sm.StateMachijust.prototype.addChild = function(child) {
  if (!this.hasChild(child)) {
    this.__childs.push(child);
  }
};


/**
 * @param {!just.sm.StateMachine} child
 */
just.sm.StateMachijust.prototype.removeChild = function(child) {
  var index = just.utils.indexOf(child, this.__childs);

  if (index !== -1) {
    this.__childs.splice(index, 1);
  }
};


/**
 * @param {!just.sm.StateMachine} child
 */
just.sm.StateMachijust.prototype.removeAllChildren = function(child) {
  this.__childs = [];
};


/**
 * @param {!just.sm.StateMachine} child
 */
just.sm.StateMachijust.prototype.hasChild = function(child) {
  return just.utils.indexOf(child, this.__childs) !== -1;
};


/**
 * @return {!Array.<!just.sm.StateMachine>}
 */
just.sm.StateMachijust.prototype.getChildren = function() {
  return this.__childs;
};
