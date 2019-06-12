const PROXY_CONFIG = [
	{
		context: ['/api' ],
		target: 'http://localhost:5000/api',
		secure: false,
		logLevel: 'debug'
	}
];

module.exports = PROXY_CONFIG;
