

/**
 * @constructor
 * @param {!Function} check
 * @param {fm.Script} script
 */
sm.Transition = function(check, script) {
  /**
   * @type {function(!sm.State):boolean}
   */
  this.check = check;

  /**
   * @type {fm.Script}
   */
  this.script = script;
};
