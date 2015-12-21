'use strict';

var request = require('request');
var _ = require('underscore');

class RequestHandler {

	openStream (options) {
		if (!options || typeof options.url !== 'string' || !options.url.length) {
			return null;
		}

		options = _.defaults(
			options,
			{
				followRedirect: options.followRedirect,
				maxRedirects: options.maxRedirects,
				strictSSL: options.strictSSL,
				timeout: options.timeout,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',

					'Accept-Language': 'en',
					'Accept': '*/*',

					'Connection': 'close',

					'Cache-Control': 'no-cache',
					'Pragma': 'no-cache'
				},
				method: 'GET',
				lookup: options.dnsResolver,
				pool: false,
				gzip: false
			}
		);

		if (options.compression === true) {
			options.headers = {
				'Accept-Encoding': 'gzip, deflate'
			};
			options.gzip = true;
		}

		try {
			this.stream = request(options);
			this.stream.noDelay = true;
		}
		catch (e) {}

		return this.stream;
	}

	closeStream () {
		try {
			this.stream && this.stream.abort();
		}
		catch (e) {}
	}
}

module.exports = RequestHandler;
