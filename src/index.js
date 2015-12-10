'use strict';

var CompressionStreamHandler = require('./compression-stream-handler');
var RequestStreamHandler = require('./request-stream-handler');
var _ = require('underscore');

class UrlFetcher {

	static scrape (options, contentStreamHandler, callback) {
		options = _.defaults(options||{}, {
			overallTimeout: 35000
		});

		var requestStreamHandler = new RequestStreamHandler();
		var compressionStreamHandler = new CompressionStreamHandler();

		var cleanup = () => {
			requestStreamHandler.closeStream();
			compressionStreamHandler.closeStream();
			contentStreamHandler.closeStream();
		};

		var called = false;
		var _callback = (err, results) => {
			if (called) { return; }

			called = true;
			cleanup();
			clearTimeout(callbackTimeout);

			return callback(err, { content: results });
		};

		var callbackTimeout = setTimeout(() => {
			_callback( new Error('UrlFetcher::scrape() - Callback timeout') );
		}, options.overallTimeout);

		var requestStream = requestStreamHandler.openStream(options);

		if (!requestStream) {
			return _callback( new Error('UrlFetcher::scrape() - No request handler was found for URL: `' + options.url + '`') );
		}

		requestStream.on('error', err => _callback(err) );

		requestStream.once('response', res => {
			var err = this.extractRequestResponseError(res, options.url);
			if(err) { return _callback(err); }

			var compressionStream = compressionStreamHandler.openStream(res);

			if (compressionStream !== null) {
				compressionStream.on('error', err => _callback(err) );

				res.pipe(compressionStream);
			}
			else {
				compressionStream = res;
			}

			var contentStream = getContentStreamHandler.openStream(res, options, _callback);

			if (contentStream === null) {
				return _callback( new Error('UrlFetcher::scrape() - No content handler was found for MIME type: `' + res.headers['content-type'] + '`') );
			}

			compressionStream.setEncoding('utf8');
			compressionStream.pipe(contentStream);
		});
	}

	static extractRequestResponseError (res, url) {
		if (res.statusCode === 204) {
			return new Error('UrlFetcher::scrape() - Page at URL: `' + url + '` is empty and returned HTTP status code 204');
		}

		if (res.statusCode === 404) {
			return new Error('UrlFetcher::scrape() - Page at URL: `' + url + '` doesn\'t exist and returned HTTP status code 404');
		}

		if (res.statusCode < 200 || res.statusCode > 299) {
			return new Error('UrlFetcher::scrape() - Request to URL: `' + url + '` encountered an error code and returned HTTP status code `' + res.statusCode + '`');
		}

		return null;
	}
}


module.exports = UrlFetcher;
