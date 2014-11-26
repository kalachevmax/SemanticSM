

/**
 * @constructor
 * @param {string} event
 * @param {!Array.<sm.StateParam>=} opt_params
 */
sm.State = function(event, opt_params) {
  /**
   * @type {string}
   */
  this.__id = event + opt_params ? opt_params.join('') : '';
};

sm.State.NULL = new sm.State('null');


/**
 * @return {string}
 */
sm.State.prototype.toString = function() {
  return this.__id;
};
