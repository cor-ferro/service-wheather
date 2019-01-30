const {
    PROVIDERS,
    get: getWheather
} = require('./lib/getWheather');

const fastify = require('fastify')()

const UPDATE_TIME = 1000 * 60 * 10; // 10 minutes

let actualWheater = null;

const loadWheather = () => {
    getWheather({}).then((output) => {
        actualWheater = output;
    });
}

setInterval(() => {
    loadWheather();
}, UPDATE_TIME);

loadWheather();

fastify.get('/actual', async () => {
    if (actualWheater) {
        return actualWheater;
    }

    return {};
})

const start = async () => {
    try {
        await fastify.listen(3000)
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()