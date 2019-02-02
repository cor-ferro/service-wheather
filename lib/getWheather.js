const YandexWheather = require('./yandexWheather');

const PROVIDERS = {
    YANDEX: 'YANDEX'
}

const DATA_INVALIDATE_TIME = 1000 * 60 * 7;

class DataRecord {
    constructor(data) {
        this.data = data;
        this.createdAt = Date.now();
    }

    getData() {
        return this.data;
    }

    getCreatedAt() {
        return this.createdAt;
    }
}

class DataManager {
    constructor() {
        this.data = new Map();
    }

    get(key) {
        return this.data.get(key);
    }

    set(key, data) {
        const record = new DataRecord(data);
        this.data.set(key, record);

        return record;
    }

    getData() {
        return this.data;
    }

    createKey(obj) {
        return JSON.stringify(obj);
    }
}

const dataManager = new DataManager();

let invalidateTimerId = null;

const invalidateHandler = () => {
    const allData = dataManager.getData();

    if (allData.size === 0) {
        return;
    }

    const keys = [];

    const now = Date.now();
    allData.forEach((record, key) => {
        const elapsedTime = now - record.getCreatedAt();

        if (elapsedTime >= DATA_INVALIDATE_TIME) {
            keys.push(key);
        }
    });

    console.log(`invalidate ${keys.length} records`);

    keys.forEach((key) => {
        allData.delete(key);
    });
}

module.exports = {
    PROVIDERS,
    async get({provider = PROVIDERS.YANDEX, ...params}) {
        const key = dataManager.createKey(params);

        console.log(`get key: ${key}`);
        const record = dataManager.get(key);

        if (record) {
            console.log('return exists record');
            return record.getData();
        }

        let instance = null;

        switch(provider) {
            case PROVIDERS.YANDEX: {
                instance = new YandexWheather();
                break;
            }

            default:
                return Promise.reject(new Error(`unsupported provider ${provider}`));
        }

        const data = await instance.load(params);

        console.log('create new record');
        dataManager.set(key, data);

        return data;
    },
    startInvalidateTimer() {
        if (invalidateTimerId) {
            clearInterval(invalidateTimerId);
        }

        invalidateTimerId = setInterval(invalidateHandler, DATA_INVALIDATE_TIME);
    },
    stopInvalidateTimer() {
        if (invalidateTimerId) {
            clearInterval(invalidateTimerId);
        }
    }
}