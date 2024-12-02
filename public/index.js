const express = require('express');
const app = express();
const port = 3000;

// 라우트 설정
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// 서버 시작
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
