if (process.argv[2] === 'server') {
    console.log('start as server');
    require('./server');
} else {
    const {
        PROVIDERS,
        get: getWheather
    } = require('./lib/getWheather');

    getWheather({
        lat: '59.943688',
        lon: '30.351207'
    }).then((output) => {
        console.log(output)
    });
}