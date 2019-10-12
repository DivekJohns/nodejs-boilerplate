const User = require('../../models/client/user-model');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = class AccountController {
	static userLogin(loginRequest) {
		return new Promise((resolve, reject) => {
			User.getAuthenticated(loginRequest.email, loginRequest.password, (err, user, reason) => {
				if (err) reject(err);
				if (user) {
					const token = jwt.sign({ _id: user._id, email: user.contactInfo.email }, process.env.JWT_KEY, {
						expiresIn: process.env.PASSWORD_EXPIRY_HR
					});
					resolve({ token: token, expiresIn: process.env.PASSWORD_EXPIRY_HR, userId: user._id, name: user.firstName + ' ' + (user.lastName || '') });
				} else {
					var reasons = User.failedLogin;
					switch (reason) {
					case reasons.NOT_FOUND:
						reject({ message: 'User not found' });
						break;
					case reasons.PASSWORD_INCORRECT:
						reject({ message: 'Password was incorrect' });
						break;
					case reasons.PASSWORD_INVALID:
						reject({ message: 'Password was Invalid' });
						break;
					case reasons.USER_BLOCKED:
						// temporarily locked
						reject({ message: 'User has been blocked' });
						break;
					case reasons.USER_UNAUTHROIZED:
						reject({ message: 'User verification pending please verify' });
						break;
					default:
						reject({ message: 'Unknown exception' });
					}
				}
			});
		});
	}

	//*reset password starts here --->
	static resetPassword(requestObject) {
		return new Promise((resolve, reject) => {
			User.findOne({ resetPasswordToken: requestObject.resetPasswordToken })
				.then((userData) => {
					if (!userData) {
						reject({message: 'Invalid token'});
					} else {
						jwt.verify(requestObject.resetPasswordToken, process.env.JWT_KEY, (err)=> {
							if(err){
								reject({message: 'Invalid token'});
							}
							let passwordhash = requestObject.password;
							passwordhash = bcrypt.hashSync(passwordhash, bcrypt.genSaltSync(8));
							User.updateMany({
								resetPasswordToken: requestObject.resetPasswordToken
							}, {
								$set: {
									'contactInfo.password': passwordhash,
									resetPasswordToken: ''
								}
							})
								.then((result) => {
									resolve({
										result: result.nModified,
										message: 'Successfully updated your password '
									});
								})
								.catch((err) => {
									reject({
										message: 'failed to update password',
										error: err
									});
								});
						});
					}
				});
		});
	}
	//<---- end of reset password 

	// forget password ---->/*
	static forgetPassword(email, origin) {
		return new Promise((resolve, reject) => {
			let resetpasswordurl = 'this is a test forget mail will e working after implimantation'||origin;
			let useremail = User.findOne({ 'contactInfo.email': email });
			if (!useremail) reject({
				message: 'Invalid  Email Id'
			});
			const token = jwt.sign({
				email: email
			}, process.env.JWT_KEY, {
				expiresIn: '1h'
			});
			User.findOneAndUpdate(
				{ 'contactInfo.email': email },
				{
					$set: {
						resetPasswordToken: token
					}
				}).then((user) => {
				if (!user) {
					reject({
						message: 'User Not Found or invalid  email id'
					});
				} else {
					const emaildata = {
						to: email,
						from: 'divek@zibtek.in',
						subject: 'PetNetX Reset password',
						html: '<h3><b>Reset Password</b></h3>' +
								'<p>You have requested to reset your password. Click on this link to reset your password:</p>' +
								'<a href=' + resetpasswordurl + '/' + 'reset-password?key=' + token + '">' + resetpasswordurl + 'reset-password/' + + '/' + token + '</a>' +
								+'<br>' +
								'<p>If you did not request to have your password reset, you can safely delete and ignore this email.<p>'
								+ '<br>'
					};
					sgMail.setApiKey(process.env.SENDGRID_API_KEY);
					sgMail.send(emaildata);
					resolve({
						message: `Email has been sent to ${email}`,
						resetPasswordToken: token
					});
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}
	// */<---end of forget password 

	static verifyAccount(requestObject) {
		return new Promise((resolve, reject) => {
			User.findOneAndUpdate(
				{
					'_id:': requestObject.userId,
					'isAuthorized': false
				},
				{
					$set: {
						isAuthorized: true
					}
				})
				.then((user) => {
					if (!user) {
						resolve({
							message: 'User invalid or already verified please register and verify account :('
						});
					} else {
						resolve({
							message: 'Verification success try login :)',
							user
						});
					}
				}).catch((error) => {
					reject(error);
				});
		});
	}
};

