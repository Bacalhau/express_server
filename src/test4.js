var nodemailer = require('nodemailer');


//#g@a12*97H
//datahubserver@hotmail.com

var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'datahubserver@hotmail.com',
        pass: '#g@a12*97H'
    }
});


// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

var mailOptions = {
    from: '"DataHub" <servidor@jmbacalhau.com.br>', // sender address
    to: 'joaomarcusbacalhau@hotmail.com', // list of receivers
    subject: 'Password Recovery', // Subject line
    html: 'html_string'
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }        
        console.log('email sent');
    console.log('Message %s sent: %s', info.messageId, info.response);
});

