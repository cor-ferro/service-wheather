if (process.argv[2] === 'server') {
    console.log('start as server');
    require('./server');
} else {
    const {
        PROVIDERS,
        get: getWheather
    } = require('./lib/getWheather');

    getWheather({}).then((output) => {
        console.log(output)
    })
}