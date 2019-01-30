const BaseWheather = require('./baseWheather');

const request = require('request-promise');
const cheerio = require('cheerio');

class YandexWheather extends BaseWheather {
    parseTempText(str) {
        return parseFloat(str.replace('−', '-')); // 8722 code
    }

    async load() {
        const lat = '59.943688';
        const lon = '30.351207';
        
        return request(`https://yandex.ru/pogoda/saint-petersburg?lat=${lat}&lon=${lon}`)
            .then((htmlString) => {
                const $ = cheerio.load(htmlString);
                
                const $factTemp = $('.fact .temp.fact__temp');
                const factTempValue = this.parseTempText($factTemp.find('.temp__value').text());

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

                return {
                    fact: {
                        temp: factTempValue
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