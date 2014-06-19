

/**
 * @constructor
 * @param {string} eventType
 * @param {!Array.<just.sm.StateParam>=} opt_params
 */
just.sm.State = function(eventType, opt_params) {
  /**
   * @type {string}
   */
  this.eventType = eventType;

  /**
   * @type {!Array.<just.sm.StateParam>}
   */
  this.params = opt_params || [];
};


just.sm.State.NULL = new just.sm.State('null', []);
