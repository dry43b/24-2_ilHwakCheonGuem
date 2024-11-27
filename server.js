const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL 연결
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'user_management',
});

db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL 연결 성공!');
});

// 회원가입 API
app.post('/register', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // MySQL에 데이터 삽입
        const query = 'INSERT INTO users (email, fullname, password) VALUES (?, ?, ?)';
        db.query(query, [email, fullname, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'User registered successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 서버 실행
app.listen(3000, () => {
    console.log('서버가 http://localhost:3000에서 실행 중입니다.');
});
