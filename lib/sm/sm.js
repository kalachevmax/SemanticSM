

/**
 * @typedef {*}
 */
just.sm.StateParam;


/**
 * @typedef {!Array.<string|!Array.<just.sm.StateParam>|!Function|just.sm.Script>}
 */
just.sm.TransitionDefinition;


/**
 * @typedef {!Object.<string, just.sm.TransitionTo>}
 */
just.sm.TransitionFrom;


/**
 * @typedef {!Object.<string, !just.sm.Transition>}
 */
just.sm.TransitionTo;


/**
 * @typedef {!Array.<!just.sm.TransactionStep>}
 */
just.sm.TransactionStack;


var fm = just.fm;
var sm = just.sm;


/**
 * @type {just.sm.TransactionStack}
 */
just.sm.__transactionStack = [];


/**
 * @param {string} eventType
 * @param {!Array.<just.sm.StateParam>=} opt_params
 * @return {!just.sm.State}
 */
just.sm.createState = function(eventType, opt_params) {
  return new just.sm.State(eventType, opt_params);
};


/**
 * @param {!Function} check
 * @param {just.fm.Script} script
 * @return {just.sm.Transition}
 */
just.sm.createTransition = function(check, script) {
  return new just.sm.Transition(check, script);
};


/**
 * @param {!just.sm.StateMachine} stateMachine
 * @param {!just.sm.State} stateTo
 * @return {!just.sm.TransactionStep}
 */
just.sm.createTransactionStep = function(stateMachine, stateTo) {
  return new just.sm.TransactionStep(stateMachine,
      stateMachijust.getState(), stateTo);
};


/**
 * @param {!just.sm.State} stateTo
 * @return {just.fm.Action}
 */
just.sm.check = function(stateTo) {
  return function(stateMachine, complete, cancel) {
    var eventFrom = stateMachijust.getState['eventType'];
    var eventTo = stateTo['eventType'];
    var transitions = stateMachijust.getTransitions();

    complete(transitions[eventFrom] instanceof Object &&
        transitions[eventFrom][eventTo] instanceof just.sm.Transition &&
        transitions[eventFrom][eventTo].check(stateTo));
  }
};


/**
 * @param {!just.sm.State} state
 * @return {just.fm.Action}
 */
just.sm.transitTo = function(state) {
  var context = this;

  return function (stateMachine, complete, cancel) {
    var transition = stateMachijust.getTransition(state);

    transition['script'].call(context, state, function() {
      stateMachijust.setState(state);

      just.sm.__transactionStack.push(
          just.sm.createTransactionStep(stateMachine, state));

      complete();
    }, cancel);
  }
};


/**
 * @param {!just.sm.State} state
 * @return {just.fm.Action}
 */
just.sm.switchTo = function(state) {
  return function(stateMachine, complete, cancel) {
    fm.script([
      fm.if(sm.check(state), fm.script([
        sm.transitTo(state),
        fm.map(stateMachijust.getChildren())(sm.switchTo(state))
      ]))
    ])(stateMachine, complete, cancel);
  }
};


/**
 * @return {just.fm.Action}
 */
just.sm.reverse = function() {
  var context = this;

  return function(transactionStep, complete, cancel) {
    var stateMachine = transactionStep['stateMachine'];
    var stateFrom = transactionStep['stateFrom'];
    sm.transitTo(stateFrom).call(context, stateMachine, complete, cancel);
  }
};


/**
 * @param {string} eventType
 * @param {!Array.<just.sm.StateParam>=} opt_params
 * @return {just.fm.Action}
 */
just.sm.startTransaction = function(eventType, opt_params) {
  var context = this;

  return function(stateMachine, complete, cancel) {
    var state = new just.sm.State(eventType, opt_params);

    function rollback() {
      fm.map(just.sm.__transactionStack).call(context, sm.reverse, function() {
        just.sm.__transactionStack = [];
        cancel('Transaction has been rolled back');
      }, cancel);
    }

    just.sm.switchTo(state).call(this, stateMachine, complete, rollback);
  }
};
