const express = require('express');
const path = require('path');
const axios = require('axios'); // axios 패키지 사용
const app = express();
const PORT = 3000;

// 정적 파일 서비스 제공 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트: 실시간 가상화폐 가격 정보 제공
app.get('/api/prices', async (req, res) => {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'bitcoin,ethereum',
                vs_currencies: 'usd'
            }
        });
        res.json(response.data); // 데이터 반환
    } catch (error) {
        console.error('Error fetching data from CoinGecko API', error);
        res.status(500).send('Failed to fetch prices');
    }
});

// 기본 경로
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
