var nodemailer = require("nodemailer");

const emailVerification = (email, code) => {
  const mailOptions = {
    from: `BodySlides<${process.env.FROM}>`, // sender address
    to: email, // list of receivers
    subject: "Email Verification", // Subject line
    html: `<p>bodyslides requires a verified email so that you can discuss, view masasage businesses and masseuses, and recover your account in the future. <br> To complete your signup, verify your account by clicking the link below, </p>
      <div style="padding:50px 100px">
      <button style="padding: 15px 45px!important; color:#105c9b !important;
      background: #FFFFFF !important;
      cursor:pointer !important;
      font-weight: 500;text-transform: capitalize !important;
      font-size:16px !important;
      line-height: 1em !important;
    border: 2px solid #105C9B !important;
    box-shadow: 2px 2px 0px #105C9B !important;
    border-radius: 4px !important;"><a style="text-decoration:none;
    font-size:16px !important;
    " href="${process.env.FRONT_END_URL}/verify-email/?token=${code}"> Verify Email Address </a></button><br/>
      </div>
	  
	  <p>This email message was auto-generated.<br>All rights reserved</p>

	  <p><a href="https://bodyslides.ca">https://bodyslides.ca/</a></p>
	 
	`,
  };
  return mailOptions;
};

const emailForgotPassword = (email, code, firstName, lastName) => {
  console.log(email, code, firstName, lastName);
  const mailOptions = {
    from: `BodySlides<${process.env.FROM}>`, // sender address
    to: email, // list of receivers
    subject: "Password Reset Code", // Subject line
    html: `<p> Hello ${firstName || ""} ${lastName || ""},<br>
	  Use this code into the verification code screen to continue with the password reset process.<br>
		  Email verification code: <b>${code}</b>. <br>
		  Once you use it, you will be prompted to change your password.		  
		  </p>
		  
	       <p>If you didn't recently attempt to change your password with this email address, you can safely disregard this email. This notification has been sent to the email address associated with your bodyslides account.</p>
		   <p>This email message was auto-generated. <br> All rights reserved. </p>  
		   <p><a href="https://bodyslides.ca">https://bodyslides.ca/</a> </p>
		   `,
  };
  return mailOptions;
};

const codeResend = (email, code) => {
  const mailOptions = {
    from: `BodySlides<${process.env.FROM}>`, // sender address
    to: email, // list of receivers
    subject: "Password Reset Code", // Subject line
    html: `<p>Your new email verification code is ${code}</p>`, // plain text body
  };
  return mailOptions;
};

const codeResen = (email, code) => {
  const mailOptions = {
    from: `BodySlides<${process.env.FROM}>`, // sender address
    to: email, // list of receivers
    subject: "Password Reset Code", // Subject line
    html: `<p>Your new email verification code is ${code}</p>`, // plain text body
  };
  return mailOptions;
};

const advertiseEmail = (email, code, business, fileurl, atu, receiver) => {
  var maillist = [receiver, process.env.FROM];

  const mailOptions = {
    from: `BodySlides<${process.env.FROM}>`, // sender address
    to: maillist, // list of receivers
    subject: "Advertisement of Business", // Subject line
    html: `<p>Business name is ${business}</p>
    <p>Business email is ${email}</p>
    <p><a href=${atu}>Advertisement Target URL/</a></p>
    <p><a href=${fileurl}>File URL/</a></p>
    `, // plain text body
  };
  return mailOptions;
};

function sendEmail(email, code, flag, firstName, lastname, atu, receiver) {
  console.log(flag);
  console.log("email body is ", email);
  console.log("Business name is ", firstName);
  console.log("File url is ", lastname);
  console.log("Advertise url is ", atu);
  console.log("receiver email is ", receiver);
  const transporter = nodemailer.createTransport({
    // host: process.env.HOST,
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.FROM,
      pass: process.env.PASSWORD,
    },
  });
  const mailOptions =
    flag == 1
      ? emailVerification(email, code)
      : flag == 2
      ? emailForgotPassword(email, code, firstName, lastname)
      : flag == 3
      ? codeResend(email, code)
      : flag == 4
      ? advertiseEmail(email, code, firstName, lastname, atu, receiver)
      : "";
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
      return new Error("Something went wrong", err);
    } else {
      console.log(info);
      return info;
    }
  });
}

module.exports = sendEmail;
