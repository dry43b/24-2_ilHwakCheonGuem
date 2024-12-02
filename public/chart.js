const MAX_CHART = 6;
        const SEC = 1000;
        const MIN = 60000;
        const gUpdateInterval = {
            '1s': 1 * SEC,
            '3s': 3 * SEC,
            '5s': 5 * SEC,
            '10s': 10 * SEC,
            '30s': 30 * SEC,
            '1m': 1 * MIN,
            '30m': 30 * MIN,
            '1h': 60 * MIN,
        }
        let gAllCoinsInfo;         // 전체 마켓 코인 메타 정보
        let gSelectedCoins = [];   // 선택된 코인 정보
        let gSelectedUnitIndex = 7;  // 시간 표시 정보 (index)
        let gSelectedUnitValue = ''; // 시간 표시 정보
        let gIntervalId;             // 주기적으로 차트 업데이트를 할 때, interval Id
        let gInterval;               // interval 간격 시간 (ms)

        async function onLoad() {
            console.log('> onLoad')
            console.log("localStorage=", JSON.stringify(window.localStorage));
            await init();
            await redrawAll();
        }

        async function init() {
            console.log('> init')
            await getAllCoinInfo();
            await getMarketList();
            console.log('getAllCoinInfo done');
            setSelectTags()
            console.log('set select list');

            // 저장된 캔들 시간 유닛 읽어오기
            gSelectedUnitIndex = getData("candleUnit");
            if (gSelectedUnitIndex == undefined) {
                console.log('gSelectedUnitIndex = undefined');
                gSelectedUnitIndex = 7; // 디폴드 4시간봉
                setData("candleUnit", 7);
            }
            let selectUnitElement = document.getElementById("selectUnit");
            selectUnitElement.selectedIndex = gSelectedUnitIndex;
            gSelectedUnitValue = selectUnitElement.options[selectUnitElement.selectedIndex].value;

            console.log("selectUnitElement.options[e.selectedIndex] : " + gSelectedUnitValue);

            // 유저가 선택했던 코인 리스트 읽어오기
            let savedValue = getData("markets");
            console.log(`getData market=${savedValue}`);
            if (savedValue && savedValue.length > 3) {
                let markets = savedValue.split(',');
                
                gSelectedCoins = [];              
                markets.forEach(market => {
                    if (market != 'None') {
                        let info = gAllCoinsInfo.KRWDict[market];
                        gSelectedCoins.push({
                            market,
                            name : info.name
                        })
                    }
                })
            } else {
                console.log('no saved data form markets')
            }
            let idx = 0;
            gSelectedCoins.forEach(coin => {
                setSelectMarket(idx, gAllCoinsInfo.KRWDict[coin.market].index + 1)
                idx += 1;
            })
            console.log(JSON.stringify(gSelectedCoins));
            console.log('> init done')
        }

        // 캔들 시간 유닛 변경 시. localStorage에 업데이트 후 차트 다시 그리기
        async function selectUnitOnChange(index, unit, text) {
            console.log(`> selectUnitOnChange > index=${index}, unit value=${unit}, text=${text}`);
            gSelectedUnitIndex = index;
            gSelectedUnitValue = unit;
            setData("candleUnit", gSelectedUnitIndex);
            await redrawAll();
        }

        // 업데이트 간격 변경시
        function updateIntervalOnChange(index, unit, text) {
            console.log(`> updateIntervalOnChange > index=${index}, unit value=${unit}, text=${text}`);

            if (gIntervalId) {
                clearInterval(gIntervalId);
                gInterval = 0;
            }
            if (unit == 'None') {
                console.log('update interval = 0');
                gInterval = 0;
                return;
            }
            gInterval = gUpdateInterval[unit];
            startInterval();
        }

        // 반복 시작
        function startInterval() {
            console.log("> startInterval");
            if (gInterval && gInterval > 0) {
                gIntervalId = setInterval(intervalHandler, gInterval);
            }
        }

        // 반복 처리 함수. 전체 코인 시세를 가져와서 다시 그리기
        async function intervalHandler() {
            console.log("> intervalHandler");
            await redrawAll();
        }

        // 코인 셀렉트에서 변경 시
        async function selectOnChange(selId, value, text) {
            console.log(`> selectOnChange${selId} : ${value}, ${text}`);
            gSelectedCoins[selId] = {
                market: value,
                name: text,
            };

            let chartDivElement = document.getElementById(`chart${selId}`);
            if (value == 'None') {
                chartDivElement.hidden = 'hidden';
            } else {
                chartDivElement.hidden = undefined;
            }

            let markets = [];
            gSelectedCoins.forEach(coin => {
                if (coin.market != 'None') markets.push(coin.market);
            })

            console.log(markets.join(','));
            setData('markets', markets.join(','));

            if (value != 'None') {
                let res = await getBitPrice({count: 100, market: value, unit: gSelectedUnitValue, name: text});
                drawChart(res.trace, res.info, `chart${selId}`);
            }
        }

        // 전체 차트 시세 읽어와서 다시 그리기
        async function redrawAll() {
            console.log('> redrawAll');
            console.log(JSON.stringify(gSelectedCoins));
            for (let i = 0; i < gSelectedCoins.length; i += 1) {
                coin = gSelectedCoins[i];
                let chartDivElement = document.getElementById(`chart${i}`);
                if (coin.market != 'None') {
                    chartDivElement.hidden = undefined;
                    let res = await getBitPrice({count: 100, market: coin.market, unit: gSelectedUnitValue, name: coin.name});
                    drawChart(res.trace, res.info, `chart${i}`);
                } else {
                    chartDivElement.hidden = 'hidden';
                }
            }
        }

        function setSelectMarket(selId, index) {
            let selectElement = document.getElementById(`selectMarket${selId}`);
            selectElement.selectedIndex = index;
        }

        // 동적으로 코인 리스트 옵션 추가.
        function setSelectTags() {
            for (let selId = 0; selId < MAX_CHART; selId += 1) {
                let selectId = `selectMarket${selId}`;
                let lnth = gAllCoinsInfo.KRW.length;

                let select = document.getElementById(selectId);
                let option = document.createElement("option");
                option.text = 'None';
                option.value = 'None';
                select.appendChild(option);

                for (let i = 0; i < lnth; i += 1) {
                    option = document.createElement("option");
                    option.text = gAllCoinsInfo.KRW[i].name;
                    option.value = gAllCoinsInfo.KRW[i].market;
                    select.appendChild(option);
                }
            }
        }

        // 전체 코인 메타 정보 가져오기
        async function getAllCoinInfo() {
            let url = `https://api.upbit.com/v1/market/all`;
            const response = await fetch(url);
            const coinInfos = await response.json();

            // 코인 검색시 JSON 형태가 쉬울때가 많아서 리스트와 함께 두가지 형태로 저장한다
            gAllCoinsInfo = {
                "KRW" : [],
                "KRWDict" : {},
            };

            let KRW = [], head = [];
            let KRWDict = {};

            coinInfos.forEach(info => {
                let ids = info.market.split("-");

                if (ids[0] == 'KRW') {
                    let name = info.korean_name;
                    let en_name = info.english_name;

                    // 비트코인과 이더리움은 정렬에서 제외시키고 맨앞에 둔다.
                    if (ids[1] == 'BTC' || ids[1] == 'ETH') {
                        head.push({
                            market : info.market, name, en_name,
                        })
                    } else {
                        KRW.push({
                            market : info.market, name, en_name,
                        })
                    }
                    
                }
            })
            KRW = KRW.sort((a, b) => a.name > b.name ? 1 : -1);

            gAllCoinsInfo.KRW = head.concat(KRW);

            for(let i=0; i<gAllCoinsInfo.KRW.length; i += 1) {
                let coin = gAllCoinsInfo.KRW[i];
                gAllCoinsInfo.KRWDict[coin.market] = {
                    index: i,
                    market: coin.market,
                    name: coin.name,
                    en_name: coin.en_name,
                }
            }
            console.log(gAllCoinsInfo)
        }

        async function getMarketList() {
            const ul = document.getElementById("myList");

            // 리스트의 각 항목을 <li>로 추가
            gAllCoinsInfo.KRW.forEach(item => {
            const li = document.createElement("li");  // <li> 요소 생성
            li.textContent = item.name;                    // <li> 요소에 텍스트 추가
            ul.appendChild(li);                       // <ul>에 <li> 요소 추가
    });
            console.log("getMarketList done");
        }

        // 특정 코인 캔들 정보 리스트 가져오기
        async function getBitPrice({count, market, unit, name}) {
            let url = `https://api.upbit.com/v1/candles/minutes/${unit}?market=${market}&count=${count}`;
            const response = await fetch(url);
            const prices = await response.json();
            console.log("getBitPrice done");

            let pricesSorted = prices.sort((a, b) => a.timestamp - b.timestamp)
            let x = [];
            let high = [];
            let low = [];
            let open = [];
            let close = [];

            let info = {};
            lowest_price = pricesSorted[0].low_price;;
            highest_price = pricesSorted[0].high_price;
            pricesSorted.forEach((p) => {
                x.push(p.candle_date_time_kst);//.split("T")[0]);
                high.push(p.high_price);
                low.push(p.low_price);
                open.push(p.opening_price);
                close.push(p.trade_price);

                lowest_price = lowest_price > p.low_price ? p.low_price : lowest_price;
                highest_price = highest_price < p.high_price ? p.high_price : highest_price;
            })
            
            info = {
                lowest_price,
                highest_price,
                market,
                name,
                current_price : pricesSorted[pricesSorted.length-1].trade_price,
            }
            let trace = {
                x,
                high,
                low,
                open,
                close,
                decreasing: {line: {color: 'blue'}},
                increasing: {line: {color: 'red'}},
                line: {color: 'rgba(31,119,180,1)'},
                type: 'candlestick', 
                xaxis: 'x', 
                yaxis: 'y'
            }
            console.log(info);
            return {trace, info};
        }

        function drawChart(trace, info, divId) {
            var data = [trace];
                
            var layout = {
                dragmode: 'zoom', 
                margin: {
                    r: 10, 
                    t: 25, 
                    b: 40, 
                    l: 60
                }, 
                showlegend: false, 
                xaxis: {
                    autorange: true, 
                    domain: [0, 1], 
                    //range: ['2017-01-03 12:00', '2017-02-15 12:00'], 
                    range: [trace.x[0], trace.x[trace.x.length - 1]],
                    rangeslider: {range: [trace.x[0], trace.x[trace.x.length - 1]]}, 
                    title: info.name + ' / ' + info.market + ' / ' + String(info.current_price), 
                    type: 'date',
                    rangeslider: {
                        visible: false
                    }
                }, 
                yaxis: {
                    autorange: true, 
                    domain: [0, 1], 
                    range: [info.lowest_price * 0.95, info.highest_price * 1.05], 
                    type: 'linear'
                }
            };
                
            Plotly.newPlot(divId, data, layout);
        }

        function setData(key, value) {
            window.localStorage.setItem(key, value);
        }

        function getData(key) {
            let value = window.localStorage.getItem(key);
            return value;
        }