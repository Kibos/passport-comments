# 四个阶段
======
## 初始化
　　1. 挂载中间件，定义相关处理方法（request.js）
　　2. 添加验证策略，设置passport
　　3. app.use添加验证中间件
　　4. 在特定路由(例如登录路由)上挂载验证中间件
# 认清session的用途，验证的原理，如何使用session
# 持久化session，connect-mongo