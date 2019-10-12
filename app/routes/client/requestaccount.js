const express = require('express');
const router = express.Router();
const UserController = require('../../controller/client/auth-controller');

// User-Login route
router.post('/login', (req,res)=> {
	UserController.userLogin(req.body).then((data)=>{
		res.status(201).send(data);
	}).catch((err)=>{
		res.status(500).send(err);
	});
});

//user forget-password
router.put('/forget-password/:email', (req,res)=>{
	UserController.forgetPassword(req.params.email,req.headers.origin).then((data)=>{
		res.status(201).send(data);
	}).catch((err)=>{
		res.status(500).send(err);
	});
});

//Reset-password
router.put('/reset-password', (req,res)=>{
	UserController.resetPassword(req.body).then((data)=>{
		res.status(201).send(data);
	}).catch((err)=>{
		res.status(500).send(err);
	});
});

//verify-account
router.put('/verify-account/:userId', (req,res)=>{
	UserController.verifyAccount(req.params.userId)
		.then((data)=>{
			res.status(201).send(data);
		}).catch((err)=>{
			res.status(500).send(err);
		});
});


module.exports = router;