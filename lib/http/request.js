/**
 * Module dependencies.
 */
var http = require('http')
  , req = http.IncomingMessage.prototype;

//用来给req对象添加login、logout、isAuthenticated和isUnAuthenticated方法



/**
 * Intiate a login session for `user`.登陆成功后，实例化session
 *
 * Options:
 *   - `session`  Save login state in session, defaults to _true_
 *
 * Examples:
 *
 *     req.logIn(user, { session: false });
 *
 *     req.logIn(user, function(err) {
 *       if (err) { throw err; }
 *       // session saved
 *     });
 *
 * @param {User} user
 * @param {Object} options
 * @param {Function} done
 * @api public
 */
req.login =
req.logIn = function(user, options, done) {
  if (typeof options == 'function') {
    done = options;
    options = {};
  }
  options = options || {};
  
  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }
  var session = (options.session === undefined) ? true : options.session;
  
  //验证成功后,将user挂载到req.user上
  this[property] = user;
  if (session) {
    if (!this._passport) { throw new Error('passport.initialize() middleware not in use'); }
    if (typeof done != 'function') { throw new Error('req#login requires a callback function'); }
    
    var self = this;

    //验证成功后，通过回调函数将user挂载到self._passport.session.user上
    //这里的user经过serializeUser的处理，最终将user或user.id传递给了回调函数的obj
    this._passport.instance.serializeUser(user, this, function(err, obj) {
      if (err) { self[property] = null; return done(err); }
      //通过下面这句代码将obj序列化到session中
      self._passport.session.user = obj;
      done();
    });
  } else {
    done && done();
  }
};

/**
 * Terminate an existing login session.
 *
 * @api public
 */
req.logout =
req.logOut = function() {
  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }
  
  this[property] = null;
  if (this._passport && this._passport.session) {
    delete this._passport.session.user;
  }
};

/**
 * Test if request is authenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isAuthenticated = function() {
  var property = 'user';
  if (this._passport && this._passport.instance) {
    property = this._passport.instance._userProperty || 'user';
  }
  
  return (this[property]) ? true : false;
};

/**
 * Test if request is unauthenticated.
 *
 * @return {Boolean}
 * @api public
 */
req.isUnauthenticated = function() {
  return !this.isAuthenticated();
};
