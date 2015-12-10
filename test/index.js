var UrlFetcher = require('../src/index.js');
var eventStream = require('event-stream');

var contentStreamHandler = {
	openStream: (res, options, callback) => {
		return eventStream.wait(function (e, body) {
			if (e) {
				return callback(e);
			}

			callback(null, {
				// url: options.url,
				// locale: options.locale,
				html: body.toString('utf8')
			});
		});
	},

	closeStream: () => {
		console.log('close?')
	}	
}


UrlFetcher.scrape({
	followRedirect: true,
	maxRedirects: 7,
	strictSSL: false,
	timeout: 15000,
	url: 'http://www.google.com', 
	overallTimeout: 35000,
	compression: true
},
contentStreamHandler,
(err, res) => {
	console.log(err, res)
});