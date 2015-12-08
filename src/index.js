var ICompressionHandler = require('./compression-handler/i-compression-handler');
var IRequestHandler = require('./request-handler/i-request-handler');
var _ = require('underscore');

module.exports = (function () {
	'use strict';

	function URLFetcher (config) {
		config = config || {};

		this.compressionHandler = new ICompressionHandler(config.compression);
		this.requestHandler = new IRequestHandler(
			_.extend(
				config.request,
				{
					dnsResolver: config.request.dnsResolver
				}
			)
		);

		this.maxTimeout = config.maxTimeout;
	}

	URLFetcher.prototype.scrape = function (url, options, callback) {
		var streamList = [];
		var _cleanup = function () {
			streamList.forEach(function (stream) {
				var streamName = stream.constructor.name;

				if (
					streamName === 'Request' &&
					typeof stream.abort === 'function'
				) {
					try {
						stream.abort();
					}
					catch (e) {}
				}
				else if (streamName === 'Gunzip' || streamName === 'Inflate') {
					stream.end();
				}
				else {
					this.closeContentHandler();
				}
			}.bind(this));
		}.bind(this);

		var called = false;

		var callbackTimeout = setTimeout(function () {
			_callback(
				new Error('URLFetcher::scrape() - Callback timeout')
			);
		}, this.maxTimeout);

		var _callback = function (e, results) {
			if (called === true) {
				return null;
			}

			called = true;
			_cleanup();
			clearTimeout(callbackTimeout);

			if (e) {
				return callback(e, null);
			}

			callback(null, {
				parentUrl: url,
				parentType: type,

				content: results
			});
		};

		var requestHandlerStream = this.requestHandler.stream(
			url,
			options.request
		);

		if (requestHandlerStream === null) {
			return _callback(
				new Error('URLFetcher::scrape() - No request handler was found for URL: `' + url + '`')
			);
		}
		else {
			streamList.push(requestHandlerStream);
		}

		requestHandlerStream.on('error', function (e) {
			return _callback(e);
		});

		requestHandlerStream.once('response', function (res) {
			if (res.statusCode === 204) {
				return _callback(
					new Error('URLFetcher::scrape() - Page at URL: `' + url + '` is empty and returned HTTP status code 204')
				);
			}

			if (res.statusCode === 404) {
				return _callback(
					new Error('URLFetcher::scrape() - Page at URL: `' + url + '` doesn\'t exist and returned HTTP status code 404')
				);
			}

			if (res.statusCode < 200 || res.statusCode > 299) {
				return _callback(
					new Error('URLFetcher::scrape() - Request to URL: `' + url + '` encountered an error code and returned HTTP status code `' + res.statusCode + '`')
				);
			}

			var encodingType = res.headers['content-encoding'];

			var compressionHandlerStream = this.compressionHandler.stream(
				encodingType,
				options.compression
			);

			if (compressionHandlerStream !== null) {
				compressionHandlerStream.on('error', function (e) {
					return _callback(e);
				});

				res.pipe(compressionHandlerStream);

				streamList.push(compressionHandlerStream);
			}
			else {
				compressionHandlerStream = res;
			}

			var contentHandlerStream = this.openContentHandler(
				res,
				options.content,
				_callback
			);

			if (contentHandlerStream === null) {
				return _callback(
					new Error('URLFetcher::scrape() - No content handler was found for MIME type: `' + mimeType + '`')
				);
			}
			else {
				streamList.push(contentHandlerStream);
			}

			compressionHandlerStream.setEncoding('utf8');

			compressionHandlerStream.pipe(contentHandlerStream);
		}.bind(this));
	};

	return URLFetcher;
})();
