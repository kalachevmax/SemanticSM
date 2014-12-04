

/**
 * @namespace
 */
var sm = {};


/**
 * @typedef {*}
 */
sm.StateParam;


/**
 * @typedef {number}
 */
sm.ActionFlag;


/**
 * @typedef {!Array.<string|!Array.<sm.StateParam>|sm.ActionFlag>}
 */
sm.TransitionDefinition;


/**
 * @typedef {string}
 */
sm.StateID;


/**
 * @typedef {!Object.<sm.StateID, !Object.<sm.StateID, sm.ActionFlag>>}
 */
sm.TransitionsGraph;


/**
 * @typedef {!Array.<!sm.TransactionStep>}
 */
sm.TransactionStack;


/**
 * @type {sm.TransactionStack}
 */
sm.__transactionStack = [];


/**
 * @param {string} eventType
 * @param {!Array.<sm.StateParam>=} opt_params
 * @return {!sm.State}
 */
sm.createState = function(eventType, opt_params) {
  return new sm.State(eventType, opt_params);
};


/**
 * @param {!Function} check
 * @param {fm.Script} script
 * @return {sm.Transition}
 */
sm.createTransition = function(check, script) {
  return new sm.Transition(check, script);
};


/**
 * @param {sm.TransitionDefinition} transitionDefinition
 * @return {sm.State}
 */
sm.makeFromState = function(transitionDefinition) {
  if (transitionDefinition.length >= 4 &&
      typeof transitionDefinition[0] === 'string' && transitionDefinition[1] instanceof Array) {
    return sm.createState(transitionDefinition[0], transitionDefinition[1]);
  }

  return null;
};


/**
 * @param {sm.TransitionDefinition} transitionDefinition
 * @return {sm.State}
 */
sm.makeToState = function(transitionDefinition) {
  if (transitionDefinition.length >= 4 &&
      typeof transitionDefinition[2] === 'string' && transitionDefinition[3] instanceof Array) {
    return sm.createState(transitionDefinition[2], transitionDefinition[3]);
  }

  return null;
};


/**
 * @param {sm.TransitionDefinition} transitionDefinition
 * @return {sm.ActionFlag}
 */
sm.makeAction = function(transitionDefinition) {
  if (transitionDefinition.length >= 4 && typeof transitionDefinition[4] === 'number') {
    return transitionDefinition[4];
  }

  return -1;
};


/**
 * @param {!Array.<sm.TransitionDefinition>} transitionDefinitions
 * @return {sm.TransitionsGraph}
 */
sm.makeTransitionsGraph = function(transitionDefinitions) {
  var graph = {};

  for (var i = 0, l = transitionDefinitions.length; i < l; i += 1) {
    var fromState = sm.makeFromState(transitionDefinitions[i]);
    var toState = sm.makeToState(transitionDefinitions[i]);
    var action = sm.makeAction(transitionDefinitions[i]);

    if (fromState !== null && toState !== null && action !== -1) {
      if (typeof graph[fromState] === 'undefined') {
        graph[fromState] = {};
      }

      graph[fromState][toState] = action;
    } else {
      console.error('[sm.makeTransitionsGraph] incorrect transition definition', transitionDefinitions[i]);
    }
  }

  return graph;
};


/**
 * @param {!sm.StateMachine} stateMachine
 * @param {!sm.State} stateTo
 * @return {!sm.TransactionStep}
 */
sm.createTransactionStep = function(stateMachine, stateTo) {
  return new sm.TransactionStep(stateMachine,
      stateMachine.getState(), stateTo);
};


/**
 * @param {!sm.State} stateTo
 * @return {fm.Action}
 */
sm.check = function(stateTo) {
  return function(stateMachine, complete, cancel) {
    var eventFrom = stateMachine.getState['eventType'];
    var eventTo = stateTo['eventType'];
    var transitions = stateMachine.getTransitions();

    complete(transitions[eventFrom] instanceof Object &&
        transitions[eventFrom][eventTo] instanceof sm.Transition &&
        transitions[eventFrom][eventTo].check(stateTo));
  }
};


/**
 * @param {!sm.State} state
 * @return {fm.Action}
 */
sm.transitTo = function(state) {
  var context = this;

  return function (stateMachine, complete, cancel) {
    var transition = stateMachine.getTransition(state);

    transition['script'].call(context, state, function() {
      stateMachine.setState(state);

      sm.__transactionStack.push(
          sm.createTransactionStep(stateMachine, state));

      complete();
    }, cancel);
  }
};


/**
 * @param {!sm.StateMachine} stateMachine
 * @param {function(!Array.<!sm.StateMachine>)} complete
 * @param {function(string, number=)} cancel
 */
sm.getChildren = function(stateMachine, complete, cancel) {
  complete(stateMachine.getChildren());
};


/**
 * @param {!sm.State} state
 * @return {fm.Action}
 */
sm.switchTo = function(state) {
  return fm.script([
    fm.if(sm.check(state), fm.script([
      sm.transitTo(state),
      sm.getChildren,
      fm.each(sm.switchTo(state))
    ]))
  ]);
};


/**
 * @return {fm.Action}
 */
sm.reverse = function() {
  var context = this;

  return function(transactionStep, complete, cancel) {
    var stateMachine = transactionStep['stateMachine'];
    var stateFrom = transactionStep['stateFrom'];
    sm.transitTo(stateFrom).call(context, stateMachine, complete, cancel);
  }
};


/**
 * @param {string} eventType
 * @param {!Array.<sm.StateParam>=} opt_params
 * @return {fm.Action}
 */
sm.startTransaction = function(eventType, opt_params) {
  var context = this;

  return function(stateMachine, complete, cancel) {
    var state = new sm.State(eventType, opt_params);

    function rollback() {
      fm.each(sm.reverse).call(context, sm.__transactionStack, function() {
        sm.__transactionStack = [];
        cancel('Transaction has been rolled back');
      }, cancel);
    }

    sm.switchTo(state).call(this, stateMachine, complete, rollback);
  }
};
