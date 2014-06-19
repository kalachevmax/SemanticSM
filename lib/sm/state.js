

/**
 * @constructor
 * @param {string} eventType
 * @param {!Array.<sm.StateParam>=} opt_params
 */
sm.State = function(eventType, opt_params) {
  /**
   * @type {string}
   */
  this.eventType = eventType;

  /**
   * @type {!Array.<sm.StateParam>}
   */
  this.params = opt_params || [];
};


sm.State.NULL = new sm.State('null', []);
