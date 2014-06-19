

/**
 * @constructor
 * @param {!Function} check
 * @param {just.fm.Script} script
 * @param {just.fm.Script} reverseScript
 */
just.sm.Transition = function(check, script, reverseScript) {
  /**
   * @type {function(!just.sm.State):boolean}
   */
  this.check = check;

  /**
   * @type {just.fm.Script}
   */
  this.script = script;
};
