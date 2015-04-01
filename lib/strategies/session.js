/**
 * Module dependencies.
 */
var pause = require('pause')
  , util = require('util')
  , Strategy = require('passport-strategy');


/**
 * `SessionStrategy` constructor.
 *
 * @api public
 */
function SessionStrategy() {
  Strategy.call(this);
  this.name = 'session';
}

/**
 * Inherit from `Strategy`.
 */
util.inherits(SessionStrategy, Strategy);

/**
 * Authenticate request based on the current session state.
 *
 * The session authentication strategy uses the session to restore any login
 * state across requests.  If a login session has been established, `req.user`
 * will be populated with the current user.
 *
 * This strategy is registered automatically by Passport.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
SessionStrategy.prototype.authenticate = function(req, options) {
  if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
  options = options || {};

  var self = this
    , su = req._passport.session.user;
  if (su || su === 0) {
    // NOTE: Stream pausing is desirable in the case where later middleware is
    //       listening for events emitted from request.  For discussion on the
    //       matter, refer to: https://github.com/jaredhanson/passport/pull/106
    
    var paused = options.pauseStream ? pause(req) : null;
    //这里的回调函数就是Authenticator.prototype.deserializeUser方法中的参数done
    req._passport.instance.deserializeUser(su, req, function(err, user) {
      if (err) { return self.error(err); }
      if (!user) {
        delete req._passport.session.user;
        self.pass();
        if (paused) {
          paused.resume();
        }
        return;
      }
      var property = req._passport.instance._userProperty || 'user';
      //验证成功后,将user挂载到req.user上
      req[property] = user;
      self.pass();
      if (paused) {
        paused.resume();
      }
    });
  } else {
    //此处的pass方法在authenticate中间件(authenticate.js)中进行了定义
    self.pass();
  }
};


/**
 * Expose `SessionStrategy`.
 */
module.exports = SessionStrategy;
