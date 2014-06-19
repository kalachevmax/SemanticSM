

/**
 * @namespace
 */
var sm = {};


/**
 * @typedef {*}
 */
sm.StateParam;


/**
 * @typedef {!Array.<string|!Array.<sm.StateParam>|!Function|fm.Script>}
 */
sm.TransitionDefinition;


/**
 * @typedef {!Object.<string, sm.TransitionTo>}
 */
sm.TransitionFrom;


/**
 * @typedef {!Object.<string, !sm.Transition>}
 */
sm.TransitionTo;


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
 * @param {!sm.State} state
 * @return {fm.Action}
 */
sm.switchTo = function(state) {
  return function(stateMachine, complete, cancel) {
    fm.script([
      fm.if(sm.check(state), fm.script([
        sm.transitTo(state),
        fm.map(stateMachine.getChildren())(sm.switchTo(state))
      ]))
    ])(stateMachine, complete, cancel);
  }
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
      fm.map(sm.__transactionStack).call(context, sm.reverse, function() {
        sm.__transactionStack = [];
        cancel('Transaction has been rolled back');
      }, cancel);
    }

    sm.switchTo(state).call(this, stateMachine, complete, rollback);
  }
};
