const express = require('express');
const router = express.Router();
const userController = require('../../controller/client/user-controller');

//Create user
router.post('/create-user', (req, res) => {
	userController.createUser(req.body).then((data) => {
		res.status(201).send(data);
	}).catch((err) => {
		res.status(500).send(err);
	});
});

//Read User by Id
router.get('/user-info/:userId', (req, res) => {
	userController.findUserById(req.params.userId).then((data) => {
		res.status(201).send(data);
	}).catch((err) => {
		res.status(500).send(err);
	});
});

// Update user
router.put('/update-user/:userId', (req, res) => {
	req.body.userId = req.params.userId;
	userController.updateUser(req.body).then((data) => {
		res.status(201).send(data);
	}).catch((err) => {
		res.status(500).send(err);
	});
});


//Delete user
router.delete('/delete-user/:userId', (req, res) => {
	userController.deleteUser(req.params.userId).then((data) => {
		res.status(201).send(data);
	}).catch((err) => {
		res.status(500).send(err);
	});
});

module.exports = router;