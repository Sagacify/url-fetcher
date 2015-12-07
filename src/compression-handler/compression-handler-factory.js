var DeflateHandler = require('./deflate-handler');
var GzipHandler = require('./gzip-handler');

var contentEncodingMap = require('../http-specifications/content-encoding-map');

module.exports = (function () {
	'use strict';

	function CompressionHandlerFactory () {
		config = config || {};

		this.deflateHandler = new DeflateHandler(config.deflate);
		this.gzipHandler = new GzipHandler(config.gzip);
	}

	CompressionHandlerFactory.prototype.getHandler = function (contentEncoding) {
		contentEncoding = contentEncoding
			.trim()
			.toLowerCase()
			.split(/\s/)
			.shift();


		if (contentEncoding in contentEncodingMap === false) {
			return null;
		}

		var compressionHandler = null;

		switch (contentEncodingMap[contentEncoding]) {
			case 'deflate':
				compressionHandler = this.deflateHandler;
				break;
			case 'gzip':
				compressionHandler = this.gzipHandler;
				break;
		}

		return compressionHandler;
	};

	return CompressionHandlerFactory;
})();
