'use strict';

var zlib = require('zlib');
var contentEncodingMap = require('./content-encoding-map');

class CompressionStreamHandler {

	openStream (res) {
		var contentEncoding = res.headers['content-encoding'];
		if (typeof contentEncoding !== 'string' || !contentEncoding.length) {
			return null;
		}

		contentEncoding = contentEncoding
			.trim()
			.toLowerCase()
			.split(/\s/)
			.shift();


		if (contentEncoding in contentEncodingMap === false) {
			return null;
		}

		this.stream = null;

		switch (contentEncodingMap[contentEncoding]) {
			case 'deflate':
				this.stream = zlib.createInflate();
				break;
			case 'gzip':
				this.stream = zlib.createGunzip();
				break;
		}

		return this.stream;
	}

	closeStream () {
		this.stream && this.stream.end();
	}

}

module.exports = CompressionStreamHandler;
