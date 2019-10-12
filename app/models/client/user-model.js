/* eslint-disable linebreak-style */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	contactInfo: {
		role: { type: String, default: 'user'},
		email: { type: String, required: true },
		phone: { type: String},
		alternateEmail: { type: String },
		alternatePhone: { type: String }
	},
	contactDetails: {
		address: { type: String }, 
		city: { type: String },
		state: { type: String },
		zipCode: { type: String },
	},
	info:{
		dwelling:  { type: String },
		contactMethod:{ type: String },
		gender:{ type: String },
		areaType: { type: String },
		DOB:{type:String},
	},
	interestedIn:{
		areaVets:  { type: Boolean },
		discountsOnMedications:{ type: Boolean },
		discountsOnSupplies:{ type: Boolean },
		serviceProvidersArea: { type: Boolean },
		trackPet:{type:Boolean},
	},
	interests:{
		adoptPet:  { type: Boolean },
		dogPerson:{ type: Boolean },
	},
	personType:{
		catPerson:  { type: Boolean },
		travelWithPet:{ type: Boolean },
		otherPerson:{ type: Boolean },
	},
	otherArea: { type: String },
	otherDwelling: { type: String },
	firstName: { type: String, required: true},
	lastName: { type: String },
	profileImage: { type: String },
	password:{type:String, required: true},
	isBlocked:{type:Boolean, default: false},
	isAuthorized:{type:Boolean, default: false},
	resetPasswordToken:{type:String, default: 'User has never reset password'},
	createdAt: { type: Date, default: Date.now }
});
	
userSchema.methods.comparePassword = (candidatePassword,userPassword, cb)=> {
	bcrypt.compare(candidatePassword, userPassword, (err, isMatch) =>{
		if (err) return cb(err,false);
		cb(null, isMatch);
	});
};
	
// expose enum on the model, and provide an internal convenience reference 
var reasons = userSchema.statics.failedLogin = {	
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	PASSWORD_INVALID:2,
	USER_BLOCKED:3,
	USER_UNAUTHROIZED:4,
};
	
userSchema.statics.getAuthenticated = (email, password, cb)=> {
	User.findOne({ 'contactInfo.email': email }, (err, user)=> {
		if (err) return cb(err);
	
		// make sure the user exists
		if (!user) {
			return cb(null,null, reasons.NOT_FOUND);
		}
		//if password nulll
		if(!user.password){
			return cb(null, null,reasons.PASSWORD_INVALID);
		}
		if(!user.password){
			return cb(null, null,reasons.PASSWORD_INVALID);
		}
		if(!user.isAuthorized){
			return cb(null, null,reasons.USER_UNAUTHROIZED);
		}

	
		// test for a matching password
		user.comparePassword(password, user.password,(err, isMatch) => {
			if (err) return cb(err);
			// check if the password was a match
			if (isMatch) {
				if (user.isBlocked)return cb(null,user);
				return cb(null ,user);
			}
			return cb(null ,null,reasons.PASSWORD_INCORRECT);
		});
	});
};
const User =  mongoose.model('user', userSchema);
module.exports = User; 