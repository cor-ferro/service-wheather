const BaseWheather = require('./baseWheather');

const request = require('request-promise');
const cheerio = require('cheerio');

class YandexWheather extends BaseWheather {
    parseTempText(str) {
        return parseFloat(str.replace('−', '-')); // 8722 code
    }

    parseValue(str) {
        return parseFloat(str.replace(',', '.'));
    }

    async load({lat, lon}) {
        return request(`https://yandex.ru/pogoda?lat=${lat}&lon=${lon}`)
            .then((htmlString) => {
                const $ = cheerio.load(htmlString);
                
                const $factTemp = $('.fact .temp.fact__temp');
                const factTempValue = this.parseTempText($factTemp.find('.temp__value').text());

                const $factHumidity = $('.fact .fact__humidity .term__value');
                const factHumidity = $factHumidity.text();

                const $factWindSpeed = $('.fact .fact__wind-speed .term__value');
                const factWindSpeed = $factWindSpeed.text();

                const $factPressure = $('.fact .fact__pressure .term__value');
                const factPressure = $factPressure.text();

                const $feelings = $('.fact .fact__feels-like');
                const feelingTempValue = this.parseTempText($feelings.find('.temp .temp__value').text());

                const $forecast = $('.forecast-briefly .forecast-briefly__day');

                const forecast = [];
                
                $forecast.each((index, element) => {
                    const $el = $(element);

                    const dayTemp = this.parseTempText($el.find('.forecast-briefly__temp_day .temp__value').text());
                    const nightTemp = this.parseTempText($el.find('.forecast-briefly__temp_night .temp__value').text());

                    const date = new Date(Date.now());
                    date.setHours(0, 0, 0, 0);
                    date.setDate(date.getDate() + index);

                    forecast.push({
                        timestamp: date.getTime(),
                        day: {
                            temp: dayTemp
                        },
                        night: {
                            temp: nightTemp
                        }
                    });
                });

                const $location = $('.yw-location__place');
                const location = $location.text();

                return {
                    location,
                    fact: {
                        temp: factTempValue,
                        humidity: factHumidity,
                        windSpeed: factWindSpeed,
                        pressure: factPressure
                    },
                    feeling: {
                        temp: feelingTempValue
                    },
                    forecast
                };
            })

        
    }
}

module.exports = YandexWheather;