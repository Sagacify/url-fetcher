var zlib = require('zlib');

module.exports = (function () {
	'use strict';

	function DeflateHandler () {}

	DeflateHandler.prototype.stream = function () {
		return zlib.createInflate();
	};

	return DeflateHandler;
})();
