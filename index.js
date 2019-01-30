if (process.argv[3] === 'server') {
    require('./server')
} else {
    const {
        PROVIDERS,
        get: getWheather
    } = require('./lib/getWheather');

    getWheather({}).then((output) => {
        console.log(output)
    })
}