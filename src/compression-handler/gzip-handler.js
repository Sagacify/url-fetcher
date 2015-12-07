var zlib = require('zlib');

module.exports = (function () {
	'use strict';

	function GzipHandler () {}

	GzipHandler.prototype.stream = function () {
		return zlib.createGunzip();
	};

	return GzipHandler;
})();
