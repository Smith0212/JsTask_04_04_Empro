let user = require('../controllers/user');


let userRouter = (app) => {
    app.post('/v1/user/signup', user.signup);
    app.post('/v1/user/login', user.login);
    app.post('/v1/user/logout', user.logout);

    app.post('/v1/user/addTask', user.addTask);
    app.post('/v1/user/getTasks', user.getTasks);
    app.post('/v1/user/editTask/:id', user.editTask);
    app.post('/v1/user/deleteTask/:id', user.deleteTask);

    app.post('/v1/user/startTask', user.startTask);
    app.post('/v1/user/pauseTask', user.pauseTask);
    app.post('/v1/user/submitTask', user.submitTask);

}

module.exports = userRouter;

