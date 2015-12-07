var request = require('request');

var _ = require('underscore');

module.exports = (function () {
	'use strict';

	function RequestHandler (config) {
		config = config || {};

		this.defaultRequest = request.defaults(
			_.defaults(
				config,
				{
					followRedirect: config.followRedirect,
					maxRedirects: config.maxRedirects,
					strictSSL: config.strictSSL,
					timeout: config.timeout,
					headers: {
						'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',

						'Accept-Language': 'en',
						'Accept': '*/*',

						'Connection': 'close',

						'Cache-Control': 'no-cache',
						'Pragma': 'no-cache'
					},
					method: 'GET',
					lookup: config.dnsResolver,
					pool: false,
					gzip: false
				}
			)
		);
	}

	RequestHandler.prototype.stream = function (url, options) {
		_.extend(
			options,
			{
				url: url
			}
		);

		if (options.compression === true) {
			options.headers = {
				'Accept-Encoding': 'gzip, deflate'
			};
			options.gzip = true;
		}

		var requestStream = this.defaultRequest(options);

		requestStream.noDelay = true;

		return requestStream;
	};

	return RequestHandler;
})();
