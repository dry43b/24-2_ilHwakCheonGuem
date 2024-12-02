let btcChart, ethChart;
let btcPrices = []; // 비트코인 가격 저장 배열
let ethPrices = []; // 이더리움 가격 저장 배열
let timeLabels = []; // 시간 라벨 저장 배열

// 차트 초기화 함수
function initCharts() {
    const ctxBtc = document.getElementById('btc-chart').getContext('2d');
    const ctxEth = document.getElementById('eth-chart').getContext('2d');

    btcChart = new Chart(ctxBtc, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Bitcoin (BTC) Price',
                data: btcPrices,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,  // 반응형 설정
            maintainAspectRatio: false, // 비율 고정 해제
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    },
                    beginAtZero: false
                }
            }
        }
    });

    ethChart = new Chart(ctxEth, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Ethereum (ETH) Price',
                data: ethPrices,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,  // 반응형 설정
            maintainAspectRatio: false, // 비율 고정 해제
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}


// 데이터를 업데이트하고 차트를 갱신하는 함수
function updateCharts(btcPrice, ethPrice) {
    const currentTime = new Date().toLocaleTimeString(); // 현재 시간

    // 시간과 가격 배열에 값 추가
    timeLabels.push(currentTime);
    btcPrices.push(btcPrice);
    ethPrices.push(ethPrice);

    // 차트 데이터 업데이트
    btcChart.update();
    ethChart.update();
}

// 실시간 가격을 가져오는 함수
async function fetchCryptoPrices() {
    try {
        const response = await fetch('/api/prices');
        const data = await response.json();

        const btcPrice = data.bitcoin.usd;
        const ethPrice = data.ethereum.usd;

        document.getElementById('btc-price').textContent = `$${btcPrice}`;
        document.getElementById('eth-price').textContent = `$${ethPrice}`;

        updateCharts(btcPrice, ethPrice); // 차트 업데이트
    } catch (error) {
        console.error('Error fetching crypto prices', error);
    }
}

// 페이지 로드 시 차트 초기화 및 실시간 가격 가져오기
window.onload = function() {
    initCharts();
    fetchCryptoPrices();
    setInterval(fetchCryptoPrices, 10000); // 10초마다 가격 갱신
};

