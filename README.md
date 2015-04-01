# passport-comments 
----------  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;passport的验证过程主要依赖具体的验证策略来实现的，比较常用的有session策略、local策略和github策略等，验证逻辑都是在这些策略类中定义的。passport模块的定义主要包括三个部分：passport类、相关中间件和验证策略，passport自带了session验证策略，如果要使用其他验证策略，需要自行添加。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;passport的使用分为五个部分：
1. 首先必须通过`app.use(passport.initialize())`对passport进行初始化，否则后面的验证方法无法执行
2. 在全局范围内添加session验证中间件，`app.use(passport.session());`，这个主要是为了记住用户的登录状态，可以指定session过期时间
3. 给passport添加验证策略
4. 在具体的路由上使用第三步中添加的验证中间件
5. 给passport定义序列化和反序列化函数

### 1、passport类  
依赖于 `./framework/connect`  和 `./strategies/session`  
主要属性：  

        this._key = 'passport';         //挂载在session上的关键字  
        this._strategies = {};          //保存所有验证策略的对象  
        this._serializers = [];         //序列化session  
        this._deserializers = [];       //反序列化session  
        this._infoTransformers = [];    
        this._framework = null;         //保存所有中间件的对象  
        this._userProperty = 'user';    //挂载在req上的关键字 req.user  
      
#### Authenticator.prototype.init  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;进行相关初始化，添加authenticate和initialize中间件，添加session验证策略 。给req对象添加login、logout、isAuthenticated和isUnAuthenticated方法
#### Authenticator.prototype.framework  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;passport暴露的中间件是类似于connect风格的，签名如：`fn(req, res, next)`，而有的框架需要的是不同的签名风格，因此，该方法是用来做适配的，如果使用的是express框架，则不需要调用该方法。将传入的参数保存到this._framework中，参数如下：  
```js  
{  
    initialize: initialize,  
    authenticate: authenticate  
}  
```  
#### Authenticator.prototype.use  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;添加具体验证策略对象，并保存到this._strategies中，策略对象必须提供名称，例如：
`passport.use('local',new LocalStrategy(function(username,password,done){ //todo });`
#### Authenticator.prototype.unuse  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;根据策略名称，删除this._strategies中对应的验证策略对象，例如：`passport.unuse('local');  `
#### Authenticator.prototype.initialize  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;设置this._userProperty，然后调用this._framework.initialize方法生成一个初始化中间件，并返回该中间件  
#### Authenticator.prototype.authenticate  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;调用this._framework.authenticate方法生成一个验证中间件，并返回该中间件  

###2、 middleware - 相关中间件  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;主要包括initialize和authenticate，除此之外，在加载的时候还会对req对象定义多个方法
#### initialize  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;进行相关初始化工作，将session中的passport对象(req.session[passport._key])挂载到req._passport上，如果session中没有保存相关信息或者session为空，则req_passport={}  

#### authenticate  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;给验证策略添加了额外的处理方法，如：success、fail、redirect、pass、error，主要目的是对验证状态进行保存。有了这些方法，我们就可以只关心验证逻辑的定义，在验证成功或失败后只需调用这些预先定好的方法即可。该中间件对请求按照指定的策略进行验证，如果验证通过，调用success方法，用户就会登录成功，相关用户信息将被挂载到req.user上同时会生成一个session对象，如果验证失败，将会向客户端发送未授权响应。 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;该中间件需要注意的地方就是验证回调，如果提供了回调函数，那么将会覆盖默认的处理方式，即：attemp方法，此时需要自行调用req.login

	  //提供了回调函数的情况
	  app.get('/login', function(req, res, next) {
		  passport.authenticate('local', function(err, user, info) {
		    if (err) { return next(err); }
		    if (!user) { return res.redirect('/login'); }
		    req.logIn(user, function(err) {
		      if (err) { return next(err); }
		      return res.redirect('/users/' + user.username);
		    });
		  })(req, res, next);
		});




