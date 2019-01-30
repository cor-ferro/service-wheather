const YandexWheather = require('./yandexWheather');

const PROVIDERS = {
    YANDEX: 'YANDEX'
}

module.exports = {
    PROVIDERS,
    get({provider = PROVIDERS.YANDEX}) {
        switch(provider) {
            case PROVIDERS.YANDEX: {
                const instance = new YandexWheather();

                return instance.load();
            }

            default:
                return Promise.reject(new Error(`unsupported provider ${provider}`));
        }
    }
}