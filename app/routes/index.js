const userRoutes = require('../routes/client/user-route');
const accountRoutes = require('../routes/client/requestaccount');

module.exports = (app) => {
	app.use(process.env.APIVERSION, 
		userRoutes,
		accountRoutes);
};