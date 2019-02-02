const {
    PROVIDERS,
    get: getWheather,
    startInvalidateTimer
} = require('./lib/getWheather');

const fastify = require('fastify')()

fastify.get('/actual', async () => {
    try {
        const result = await getWheather({});

        return result;
    } catch (e) {
        console.error(e);
        return {};
    }
})

const getSchema = {
    querystring: {
        lat: { type: 'string' },
        lon: { type: 'string' }
    }
}

fastify.get('/get', {schema: getSchema}, async (request) => {
    const {lat, lon} = request.query;

    try {
        const result = await getWheather({lat, lon});

        return result;
    } catch (e) {
        console.error(e);
        return {};
    }
})

const start = async () => {
    try {
        startInvalidateTimer();

        await fastify.listen(3000, '0.0.0.0')
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        console.log(err);
        fastify.log.error(err)
        process.exit(1)
    }
}

start()