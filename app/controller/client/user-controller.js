const User = require('../../models/client/user-model');
const sgMail = require('@sendgrid/mail');
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// @todo verfiy if user blocked then process requests
module.exports = class UserController {
	static async createUser(creteUserData) {
		return new Promise((resolve, reject) => {
			User.findOne({ 'contactInfo.email': creteUserData.email })
				.then((email) => {
					if (email) {
						return reject(({ message: 'This email address is already registered' }));
					} else {
						let passwordhash = creteUserData.password;
						const { email, firstName } = creteUserData;
						if (!passwordhash || !email || !firstName) {
							return reject({ message: 'invalid data you passed empty field required firstname email and password :(' });
						}
						passwordhash = bcrypt.hashSync(passwordhash, bcrypt.genSaltSync(8));

						const user = new User({
							'contactInfo.email': creteUserData.email,
							'contactInfo.phone': creteUserData.phone,
							'contactInfo.alternateEmail': creteUserData.alternateEmail,
							'contactInfo.alternatePhone': creteUserData.alternatePhone,
							'contactInfo.role': creteUserData.role,

							'contactDetails.address': creteUserData.address,
							'contactDetails.city': creteUserData.city,
							'contactDetails.state': creteUserData.state,
							'contactDetails.zipCode': creteUserData.zipCode,

							'info.dwelling': creteUserData.dwelling,
							'info.contactMethod': creteUserData.contactMethod,
							'info.gender': creteUserData.gender,
							'info.areaType': creteUserData.areaType,
							'info.DOB': creteUserData.DOB,

							'interestedIn.areaVets': creteUserData.areaVets,
							'interestedIn.discountsOnMedications': creteUserData.discountsOnMedications,
							'interestedIn.discountsOnSupplies': creteUserData.discountsOnSupplies,
							'interestedIn.serviceProvidersArea': creteUserData.serviceProvidersArea,
							'interestedIn.trackPet': creteUserData.trackPet,

							'interests.adoptPet': creteUserData.adoptPet,
							'interests.dogPerson': creteUserData.dogPerson,

							'otherArea': creteUserData.otherArea,
							'otherDwelling': creteUserData.otherDwelling,
							'firstName': creteUserData.firstName,
							'lastName': creteUserData.lastName,
							'password': passwordhash,
						});
						return user.save();
					}
				})
				.then((data) => {
					if (data) {
						this.sendNewUsermail('divek@zibtek.in');
						return resolve({ user: data }, { message: 'successfully created a user ' });
					}
				})
				.catch(err => {
					return reject({ err }, { message: 'Unable to create user' });
				});
		});
	}
	static updateUser(updateRequestObject) {
		//Only pass neccessary feilds that needs to update 
		return new Promise((resolve, reject) => {

			User.findById(updateRequestObject.userId).then((user) => {
				if (!user) {
					reject({ message: 'user not found please create and update :(' });
				} else {
					let passwordhash = updateRequestObject.password;
					if (passwordhash) {
						passwordhash = bcrypt.hashSync(passwordhash, bcrypt.genSaltSync(8));
					}

					return User.findOneAndUpdate({
						_id: updateRequestObject.userId
					}, {
						$set: updateRequestObject
					}, { new: true });
				}
			}).then((result) => {
				resolve({
					updated: result,
					message: 'updated successfully'
				});
			})
				.catch((err) => {
					err.desc = 'Unable to update check user id and try again :(';
					reject(err);
				});
		});
	}

	static findUserById(userId) {
		return new Promise((resolve, reject) => {
			User.findById(userId)
				.then((user) => {
					if (user) {
						resolve({ user }, { message: 'Successfully retrived user informations' });
					} else {
						reject({ message: 'Unable to retrived  user information no user found :(' });
					}
				}).catch((error) => {
					reject(error);
				});
		});
	}

	static deleteUser(userId) {
		return new Promise((resolve, reject) => {
			User.findOneAndUpdate({ _id: userId }, { isBlocked: true })
				.then(() => {
					resolve({ message: 'Successfully deleted user' });
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
	static sendNewUsermail(to, verificationUrl = 'http://165.22.181.84', fromEmail = 'divek@zibtek.in') {


		const emailIsValid = (email) => {
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
		};

		emailIsValid(fromEmail) ? fromEmail : fromEmail;
		const emailOptions = {
			to,
			from: fromEmail || 'divek@zibtek.in',
			subject: 'PetNetX Registration',
			html: `<html>

			<head>
				<meta charset="UTF-8">
				<meta content="width=device-width, initial-scale=1" name="viewport">
				<meta name="x-apple-disable-message-reformatting">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta content="telephone=no" name="format-detection">
				<title></title>
				<!--[if (mso 16)]>
				<style type="text/css">
				a {text-decoration: none;}
				</style>
				<![endif]-->
				<!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]-->
				<!--[if !mso]><!-- -->
				<link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet">
				<!--<![endif]-->
				<style>
					#outlook a {
						padding: 0;
					}
			
					.ExternalClass {
						width: 100%;
					}
			
					.ExternalClass,
					.ExternalClass p,
					.ExternalClass span,
					.ExternalClass font,
					.ExternalClass td,
					.ExternalClass div {
						line-height: 100%;
					}
			
					.es-button {
						mso-style-priority: 100 !important;
						text-decoration: none !important;
						transition: all 100ms ease-in;
					}
			
					a[x-apple-data-detectors] {
						color: inherit !important;
						text-decoration: none !important;
						font-size: inherit !important;
						font-family: inherit !important;
						font-weight: inherit !important;
						line-height: inherit !important;
					}
			
					.es-button:hover {
						background: #555555 !important;
						border-color: #555555 !important;
					}
			
					.es-desk-hidden {
						display: none;
						float: left;
						overflow: hidden;
						width: 0;
						max-height: 0;
						line-height: 0;
						mso-hide: all;
					}
			
			
					/*
			END OF IMPORTANT
			*/
			
					html,
					body {
						width: 100%;
						font-family: helvetica, 'helvetica neue', arial, verdana, sans-serif;
						-webkit-text-size-adjust: 100%;
						-ms-text-size-adjust: 100%;
					}
			
					table {
						mso-table-lspace: 0pt;
						mso-table-rspace: 0pt;
						border-collapse: collapse;
						border-spacing: 0px;
					}
			
					table td,
					html,
					body,
					.es-wrapper {
						padding: 0;
						Margin: 0;
					}
			
					.es-content,
					.es-header,
					.es-footer {
						table-layout: fixed !important;
						width: 100%;
					}
			
					img {
						display: block;
						border: 0;
						outline: none;
						text-decoration: none;
						-ms-interpolation-mode: bicubic;
					}
			
					table tr {
						border-collapse: collapse;
					}
			
					p,
					hr {
						Margin: 0;
					}
			
					h1,
					h2,
					h3,
					h4,
					h5 {
						Margin: 0;
						line-height: 120%;
						mso-line-height-rule: exactly;
						font-family: lato, 'helvetica neue', helvetica, arial, sans-serif;
					}
			
					p,
					ul li,
					ol li,
					a {
						-webkit-text-size-adjust: none;
						-ms-text-size-adjust: none;
						mso-line-height-rule: exactly;
					}
			
					.es-left {
						float: left;
					}
			
					.es-right {
						float: right;
					}
			
					.es-p5 {
						padding: 5px;
					}
			
					.es-p5t {
						padding-top: 5px;
					}
			
					.es-p5b {
						padding-bottom: 5px;
					}
			
					.es-p5l {
						padding-left: 5px;
					}
			
					.es-p5r {
						padding-right: 5px;
					}
			
					.es-p10 {
						padding: 10px;
					}
			
					.es-p10t {
						padding-top: 10px;
					}
			
					.es-p10b {
						padding-bottom: 10px;
					}
			
					.es-p10l {
						padding-left: 10px;
					}
			
					.es-p10r {
						padding-right: 10px;
					}
			
					.es-p15 {
						padding: 15px;
					}
			
					.es-p15t {
						padding-top: 15px;
					}
			
					.es-p15b {
						padding-bottom: 15px;
					}
			
					.es-p15l {
						padding-left: 15px;
					}
			
					.es-p15r {
						padding-right: 15px;
					}
			
					.es-p20 {
						padding: 20px;
					}
			
					.es-p20t {
						padding-top: 20px;
					}
			
					.es-p20b {
						padding-bottom: 20px;
					}
			
					.es-p20l {
						padding-left: 20px;
					}
			
					.es-p20r {
						padding-right: 20px;
					}
			
					.es-p25 {
						padding: 25px;
					}
			
					.es-p25t {
						padding-top: 25px;
					}
			
					.es-p25b {
						padding-bottom: 25px;
					}
			
					.es-p25l {
						padding-left: 25px;
					}
			
					.es-p25r {
						padding-right: 25px;
					}
			
					.es-p30 {
						padding: 30px;
					}
			
					.es-p30t {
						padding-top: 30px;
					}
			
					.es-p30b {
						padding-bottom: 30px;
					}
			
					.es-p30l {
						padding-left: 30px;
					}
			
					.es-p30r {
						padding-right: 30px;
					}
			
					.es-p35 {
						padding: 35px;
					}
			
					.es-p35t {
						padding-top: 35px;
					}
			
					.es-p35b {
						padding-bottom: 35px;
					}
			
					.es-p35l {
						padding-left: 35px;
					}
			
					.es-p35r {
						padding-right: 35px;
					}
			
					.es-p40 {
						padding: 40px;
					}
			
					.es-p40t {
						padding-top: 40px;
					}
			
					.es-p40b {
						padding-bottom: 40px;
					}
			
					.es-p40l {
						padding-left: 40px;
					}
			
					.es-p40r {
						padding-right: 40px;
					}
			
					.es-menu td {
						border: 0;
					}
			
					.es-menu td a img {
						display: inline-block !important;
					}
			
			
					/* END CONFIG STYLES */
			
					a {
						font-family: helvetica, 'helvetica neue', arial, verdana, sans-serif;
						font-size: 15px;
						text-decoration: underline;
					}
			
					h1 {
						font-size: 30px;
						font-style: normal;
						font-weight: bold;
						color: #333333;
					}
			
					h1 a {
						font-size: 30px;
						text-align: center;
					}
			
					h2 {
						font-size: 20px;
						font-style: normal;
						font-weight: bold;
						color: #333333;
					}
			
					h2 a {
						font-size: 20px;
						text-align: left;
					}
			
					h3 {
						font-size: 18px;
						font-style: normal;
						font-weight: normal;
						color: #333333;
					}
			
					h3 a {
						font-size: 18px;
						text-align: left;
					}
			
					p,
					ul li,
					ol li {
						font-size: 15px;
						font-family: helvetica, 'helvetica neue', arial, verdana, sans-serif;
						line-height: 150%;
					}
			
					ul li,
					ol li {
						Margin-bottom: 15px;
					}
			
					.es-menu td a {
						text-decoration: none;
						display: block;
					}
			
					.es-wrapper {
						width: 100%;
						height: 100%;
						background-image: ;
						background-repeat: repeat;
						background-position: center top;
					}
			
					.es-wrapper-color {
						background-color: #f1f1f1;
					}
			
					.es-content-body {
						background-color: #ffffff;
					}
			
					.es-content-body p,
					.es-content-body ul li,
					.es-content-body ol li {
						color: #555555;
					}
			
					.es-content-body a {
						color: #26a4d3;
					}
			
					.es-header {
						background-color: transparent;
						background-image: ;
						background-repeat: repeat;
						background-position: center top;
					}
			
					.es-header-body {
						background-color: #333333;
					}
			
					.es-header-body p,
					.es-header-body ul li,
					.es-header-body ol li {
						color: #ffffff;
						font-size: 14px;
					}
			
					.es-header-body a {
						color: #ffffff;
						font-size: 14px;
					}
			
					.es-footer {
						background-color: transparent;
						background-image: ;
						background-repeat: repeat;
						background-position: center top;
					}
			
					.es-footer-body {
						background-color: #ffffff;
					}
			
					.es-footer-body p,
					.es-footer-body ul li,
					.es-footer-body ol li {
						color: #666666;
						font-size: 12px;
					}
			
					.es-footer-body a {
						color: #666666;
						font-size: 12px;
					}
			
					.es-infoblock,
					.es-infoblock p,
					.es-infoblock ul li,
					.es-infoblock ol li {
						line-height: 120%;
						font-size: 12px;
						color: #cccccc;
					}
			
					.es-infoblock a {
						font-size: 12px;
						color: #cccccc;
					}
			
					a.es-button {
						border-style: solid;
						border-color: #26a4d3;
						border-width: 15px 30px 15px 30px;
						display: inline-block;
						background: #26a4d3;
						border-radius: 50px;
						font-size: 14px;
						font-family: arial, 'helvetica neue', helvetica, sans-serif;
						font-weight: bold;
						font-style: normal;
						line-height: 120%;
						color: #ffffff;
						text-decoration: none;
						width: auto;
						text-align: center;
					}
			
					.es-button-border {
						border-style: solid solid solid solid;
						border-color: #26a4d3 #26a4d3 #26a4d3 #26a4d3;
						background: #26a4d3;
						border-width: 0px 0px 0px 0px;
						display: inline-block;
						border-radius: 50px;
						width: auto;
					}
			
			
					/* RESPONSIVE STYLES Please do not delete and edit CSS styles below. If you don't need responsive layout, please delete this section. */
			
					@media only screen and (max-width: 600px) {
			
						p,
						ul li,
						ol li,
						a {
							font-size: 17px !important;
							line-height: 150% !important;
						}
			
						h1 {
							font-size: 30px !important;
							text-align: center;
							line-height: 120% !important;
						}
			
						h2 {
							font-size: 26px !important;
							text-align: left;
							line-height: 120% !important;
						}
			
						h3 {
							font-size: 20px !important;
							text-align: left;
							line-height: 120% !important;
						}
			
						h1 a {
							font-size: 30px !important;
							text-align: center;
						}
			
						h2 a {
							font-size: 20px !important;
							text-align: left;
						}
			
						h3 a {
							font-size: 20px !important;
							text-align: left;
						}
			
						.es-menu td a {
							font-size: 16px !important;
						}
			
						.es-header-body p,
						.es-header-body ul li,
						.es-header-body ol li,
						.es-header-body a {
							font-size: 16px !important;
						}
			
						.es-footer-body p,
						.es-footer-body ul li,
						.es-footer-body ol li,
						.es-footer-body a {
							font-size: 17px !important;
						}
			
						.es-infoblock p,
						.es-infoblock ul li,
						.es-infoblock ol li,
						.es-infoblock a {
							font-size: 12px !important;
						}
			
						*[class="gmail-fix"] {
							display: none !important;
						}
			
						.es-m-txt-c,
						.es-m-txt-c h1,
						.es-m-txt-c h2,
						.es-m-txt-c h3 {
							text-align: center !important;
						}
			
						.es-m-txt-r,
						.es-m-txt-r h1,
						.es-m-txt-r h2,
						.es-m-txt-r h3 {
							text-align: right !important;
						}
			
						.es-m-txt-l,
						.es-m-txt-l h1,
						.es-m-txt-l h2,
						.es-m-txt-l h3 {
							text-align: left !important;
						}
			
						.es-m-txt-r img,
						.es-m-txt-c img,
						.es-m-txt-l img {
							display: inline !important;
						}
			
						.es-button-border {
							display: inline-block !important;
						}
			
						a.es-button {
							font-size: 14px !important;
							display: inline-block !important;
							border-width: 15px 25px 15px 25px !important;
						}
			
						.es-btn-fw {
							border-width: 10px 0px !important;
							text-align: center !important;
						}
			
						.es-adaptive table,
						.es-btn-fw,
						.es-btn-fw-brdr,
						.es-left,
						.es-right {
							width: 100% !important;
						}
			
						.es-content table,
						.es-header table,
						.es-footer table,
						.es-content,
						.es-footer,
						.es-header {
							width: 100% !important;
							max-width: 600px !important;
						}
			
						.es-adapt-td {
							display: block !important;
							width: 100% !important;
						}
			
						.adapt-img {
							width: 100% !important;
							height: auto !important;
						}
			
						.es-m-p0 {
							padding: 0px !important;
						}
			
						.es-m-p0r {
							padding-right: 0px !important;
						}
			
						.es-m-p0l {
							padding-left: 0px !important;
						}
			
						.es-m-p0t {
							padding-top: 0px !important;
						}
			
						.es-m-p0b {
							padding-bottom: 0 !important;
						}
			
						.es-m-p20b {
							padding-bottom: 20px !important;
						}
			
						.es-mobile-hidden,
						.es-hidden {
							display: none !important;
						}
			
						.es-desk-hidden {
							display: table-row !important;
							width: auto !important;
							overflow: visible !important;
							float: none !important;
							max-height: inherit !important;
							line-height: inherit !important;
						}
			
						.es-desk-menu-hidden {
							display: table-cell !important;
						}
			
						table.es-table-not-adapt,
						.esd-block-html table {
							width: auto !important;
						}
			
						table.es-social {
							display: inline-block !important;
						}
			
						table.es-social td {
							display: inline-block !important;
						}
					}
			
			
					/* END RESPONSIVE STYLES */
			
					.es-p-default {
						padding-top: 20px;
						padding-right: 40px;
						padding-bottom: 0px;
						padding-left: 40px;
					}
			
					.es-p-all-default {
						padding: 0px;
					}
				</style>
			</head>
			
			<body>
				<div class="es-wrapper-color">
					<!--[if gte mso 9]>
						<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
							<v:fill type="tile" color="#f1f1f1"></v:fill>
						</v:background>
					<![endif]-->
					<table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0">
						<tbody>
							<tr>
								<td class="esd-email-paddings" valign="top">
									<table class="es-content esd-header-popover" cellspacing="0" cellpadding="0" align="center">
										<tbody>
											<tr> </tr>
											<tr>
												<td class="esd-stripe" esd-custom-block-id="7958" align="center">
													<table class="es-content-body" style="background-color: transparent;"
														width="600" cellspacing="0" cellpadding="0" align="center">
														<tbody>
															<tr>
																<td class="esd-structure es-p15t es-p15b es-p10r es-p10l"
																	align="left">
																	<!--[if mso]><table width="580" cellpadding="0" cellspacing="0"><tr><td width="282" valign="top"><![endif]-->
																	<table class="es-left" cellspacing="0" cellpadding="0"
																		align="left">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="282"
																					align="left">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="es-infoblock esd-block-text es-m-txt-c"
																									align="left">
																									<p
																										style="font-family: arial, helvetica\ neue, helvetica, sans-serif;">
																										Put your preheader text
																										here<br></p>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																	<!--[if mso]></td><td width="20"></td><td width="278" valign="top"><![endif]-->
																	<table class="es-right" cellspacing="0" cellpadding="0"
																		align="right">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="278"
																					align="left">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="es-infoblock esd-block-text es-m-txt-c"
																									align="right">
																									<p><a href="http://#"
																											target="_blank"
																											style="font-family: 'arial', 'helvetica neue', 'helvetica', 'sans-serif';">View
																											in browser</a><br></p>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																	<!--[if mso]></td></tr></table><![endif]-->
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
									<table class="es-header" cellspacing="0" cellpadding="0" align="center">
										<tbody>
											<tr>
												<td class="esd-stripe" esd-custom-block-id="7387" align="center">
													<table class="es-header-body" style="background-color: rgb(255, 255, 255);"
														width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff"
														align="center">
														<tbody>
															<tr>
																<td class="esd-structure es-p30t es-p30b es-p40r es-p40l"
																	style="background-color: rgb(51, 51, 51); background-position: left top;"
																	bgcolor="#333333" align="left" esdev-config="h10">
																	<table width="100%" cellspacing="0" cellpadding="0">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="520"
																					valign="top" align="center">
																					<table width="100%" cellspacing="0"
																						cellpadding="0"
																						style="background-position: left top;">
																						<tbody>
																							<tr>
																								<td class="esd-block-image"
																									align="center">
																									<a href target="_blank"><img
																											src="https://www.logoground.com/uploads/201744362017-05-243947823GUGUK%20KOMPRANG-01.jpg"
																											alt
																											style="display: block;"
																											width="57"></a>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
									<table class="es-content" cellspacing="0" cellpadding="0" align="center">
										<tbody>
											<tr>
												<td class="esd-stripe" esd-custom-block-id="7388" align="center">
													<table class="es-content-body" style="background-color: rgb(114, 112, 112);"
														width="600" cellspacing="0" cellpadding="0" bgcolor="#333333"
														align="center">
														<tbody>
															<tr>
																<td class="esd-structure esd-checked es-p40t es-p40b es-p40r es-p40l"
																	style="background: gray;background-repeat: no-repeat; background-position: left top;background-size: 100%;"
																	align="left">
																	<table width="100%" cellspacing="0" cellpadding="0">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="520"
																					valign="top" align="center">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td align="center"
																									class="esd-block-text es-p40t es-p10b">
																									<h1 style="color : rgb(255, 255, 255)">
																										WELCOME DIVEK</h1>
																								</td>
																							</tr>
																							<tr>
																								<td esdev-links-color="#757575"
																									class="esd-block-text es-p10t es-p20b es-p30r es-p30l"
																									align="center">
																									<p style="color: #ffffff;">Get
																										started by verfying your
																										account click the below link
																										to verify ,you can also scan
																										the qr code to verify</p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-button es-p10t es-p20b"
																									align="center"> <span
																										class="es-button-border"
																										style="border-width: 0px; border-style: solid; background: none 0% 0% repeat scroll rgb(38, 164, 211); border-color: rgb(38, 164, 211);">
																										<a href="https://email/"
																											class="es-button"
																											target="_blank"
																											style="background: rgb(38, 164, 211) none repeat scroll 0% 0%; border-color: rgb(38, 164, 211);">VERIFY
																											ACCOUNT</a> </span>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
									<table class="es-content" cellspacing="0" cellpadding="0" align="center">
										<tbody>
											<tr>
												<td class="esd-stripe" align="center">
													<table class="es-content-body" width="600" cellspacing="0" cellpadding="0"
														bgcolor="#ffffff" align="center">
														<tbody>
															<tr>
																<td class="esd-structure es-p40t es-p40r es-p40l"
																	esd-custom-block-id="7389" align="left">
																	<table width="100%" cellspacing="0" cellpadding="0">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="520"
																					valign="top" align="center">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="esd-block-text es-p5t es-p15b es-m-txt-c"
																									align="left">
																									<h2>YOUR ACCOUNT HAS BEEN CREATED
																									</h2>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text es-p10b"
																									align="left">
																									<p><strong>Lorem ipsum dolor sit
																											amet, consectetur
																											adipisicing elit, sed do
																											eiusmod tempor
																											incididunt ut labore et
																											dolore magna aliqua. Ut
																											enim ad minim veniam,
																											quis nostrud
																											exercitation ullamco
																											laboris nisi ut aliquip
																											ex ea commodo
																											consequat.</strong></p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text es-p10t es-p10b"
																									align="left">
																									<p>Lorem ipsum dolor sit amet,
																										consectetur adipisicing
																										elit, sed do eiusmod tempor
																										incididunt ut labore et
																										dolore magna aliqua. Ut enim
																										ad minim veniam, quis
																										nostrud exercitation ullamco
																										laboris nisi ut aliquip ex
																										ea commodo consequat.</p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text es-p10t es-p10b"
																									align="left">
																									<p>Yours sincerely,</p>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</td>
															</tr>
															<tr>
																<td class="esd-structure es-p10t es-p40b es-p40r es-p40l"
																	esd-custom-block-id="7390" align="left">
																	<!--[if mso]><table width="520" cellpadding="0"
										cellspacing="0"><tr><td width="40" valign="top"><![endif]-->
																	<table class="es-left" cellspacing="0" cellpadding="0"
																		align="left">
																		<tbody>
																			<tr>
																				<td class="es-m-p0r es-m-p20b esd-container-frame"
																					width="40" valign="top" align="center">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="esd-block-image"
																									align="left">
																									<a target="_blank"> <img
																											src="https://demo.stripocdn.email/content/guids/videoImgGuid/images/17371562831551904.png"
																											alt
																											style="display: block;"
																											width="40"> </a>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																	<!--[if mso]></td><td width="20"></td><td width="460" valign="top"><![endif]-->
																	<table cellspacing="0" cellpadding="0" align="right">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="460"
																					align="left">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="esd-block-text es-p10t"
																									align="left">
																									<p
																										style="color: #222222; font-size: 14px;">
																										<b>PetNetX team</b></p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text"
																									align="left">
																									<p
																										style="color: #666666; font-size: 14px;">
																										Thank you</p>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																	<!--[if mso]></td></tr></table><![endif]-->
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
			
									<table class="es-content" cellspacing="0" cellpadding="0" align="center">
										<tbody>
											<tr>
												<td class="esd-stripe" esd-custom-block-id="7393" align="center">
													<table class="es-content-body" style="background-color: rgb(41, 40, 40);"
														width="600" cellspacing="0" cellpadding="0" bgcolor="#292828"
														align="center">
														<tbody>
															<tr>
																<td class="esd-structure es-p30t es-p30b es-p40r es-p40l"
																	align="left">
																	<table width="100%" cellspacing="0" cellpadding="0">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="520"
																					valign="top" align="center">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="esd-block-social"
																									align="center">
																									<table
																										class="es-table-not-adapt es-social"
																										cellspacing="0"
																										cellpadding="0">
																										<tbody>
																											<tr>
																												<td class="es-p10r"
																													valign="top"
																													align="center">
																													<a target="_blank"
																														href><img
																															title="Facebook"
																															src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-white/facebook-circle-white.png"
																															alt="Fb"
																															width="24"
																															height="24"></a>
																												</td>
																												<td class="es-p10r"
																													valign="top"
																													align="center">
																													<a target="_blank"
																														href><img
																															title="Twitter"
																															src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-white/twitter-circle-white.png"
																															alt="Tw"
																															width="24"
																															height="24"></a>
																												</td>
																												<td class="es-p10r"
																													valign="top"
																													align="center">
																													<a target="_blank"
																														href><img
																															title="Instagram"
																															src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-white/instagram-circle-white.png"
																															alt="Inst"
																															width="24"
																															height="24"></a>
																												</td>
																												<td valign="top"
																													align="center">
																													<a target="_blank"
																														href><img
																															title="Linkedin"
																															src="https://tlr.stripocdn.email/content/assets/img/social-icons/circle-white/linkedin-circle-white.png"
																															alt="In"
																															width="24"
																															height="24"></a>
																												</td>
																											</tr>
																										</tbody>
																									</table>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
									<table class="es-footer" cellspacing="0" cellpadding="0" align="center">
										<tbody>
											<tr>
												<td class="esd-stripe" esd-custom-block-id="7394" align="center">
													<table class="es-footer-body" style="background-color: rgb(255, 255, 255);"
														width="600" cellspacing="0" cellpadding="0" bgcolor="#ffffff"
														align="center">
														<tbody>
															<tr>
																<td class="esd-structure es-p40t es-p40b es-p40r es-p40l"
																	align="left">
																	<table width="100%" cellspacing="0" cellpadding="0">
																		<tbody>
																			<tr>
																				<td class="esd-container-frame" width="520"
																					valign="top" align="center">
																					<table width="100%" cellspacing="0"
																						cellpadding="0">
																						<tbody>
																							<tr>
																								<td class="esd-block-text es-p10b"
																									align="center">
																									<p>Company Address</p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text es-p10b"
																									align="center">
																									<p>This email was sent to you
																										from Company Email Address
																									</p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text es-p10b"
																									align="center">
																									<p>Preferences | Browser |
																										Forward | Unsubscribe</p>
																								</td>
																							</tr>
																							<tr>
																								<td class="esd-block-text"
																									align="center">
																									<p>Copyright © 2015-2018
																										<strong>Company
																											Name</strong>, All
																										Rights Reserved.</p>
																								</td>
																							</tr>
																						</tbody>
																					</table>
																				</td>
																			</tr>
																		</tbody>
																	</table>
																</td>
															</tr>
														</tbody>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
			
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</body>
			</html>`,
		};
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		sgMail.send(emailOptions);
	}

};

