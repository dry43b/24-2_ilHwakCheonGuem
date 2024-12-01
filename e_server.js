const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: 'a59603712@gmail.com', 
        pass: 'dqzd snza rzdx qvcs',
    },
});

app.post('/send-email', (req, res) => {
    const { email, message } = req.body;

console.log('Received request:', { email, message });

    const mailOptions = {
        from: 'a59603712@gmail.com',
        to: email,
        subject: '입력하신 정보입니다',
        text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred:', error);
            return res.status(500).send('이메일 전송 실패');
        }
        console.log('Email sent:', info.response);
        res.status(200).send('이메일 전송 성공');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
