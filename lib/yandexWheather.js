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
                
                let isCapture = false;
                let captureCount = 0;
                const maxCaptureCount = 10;

                $forecast.each((index, element) => {
                    const $el = $(element);

                    if (!isCapture) {
                        const dayName = $el.find('.forecast-briefly__name').text()

                        if (dayName === 'Сегодня') {
                            isCapture = true;
                        } else {
                            return;
                        }
                    }

                    if (captureCount >= maxCaptureCount) {
                        return;
                    }

                    const dayTemp = this.parseTempText($el.find('.forecast-briefly__temp_day .temp__value').text());
                    const nightTemp = this.parseTempText($el.find('.forecast-briefly__temp_night .temp__value').text());
                    const dateTime = $el.find('time').attr('datetime');

                    const date = new Date(dateTime);
                    date.setHours(12, 0, 0, 0);

                    forecast.push({
                        timestamp: date.getTime(),
                        dateTime: dateTime,
                        day: {
                            temp: dayTemp
                        },
                        night: {
                            temp: nightTemp
                        }
                    });

                    ++captureCount;
                });

                const $location = $('.breadcrumbs .breadcrumbs__item:last-child');
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