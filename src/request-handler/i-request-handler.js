var RequestHandler = require('./request-handler');

module.exports = (function () {
	'use strict';

	function IRequestHandler () {}

	IRequestHandler.prototype.init = function (config) {
		config = config || {};

		RequestHandler.init(config);
	};

	IRequestHandler.prototype.stream = function (strUrl, options) {
		options = options || {};

		if (typeof strUrl !== 'string' || !strUrl.length) {
			return null;
		}

		if (typeof options !== 'object') {
			return null;
		}

		return RequestHandler.stream(strUrl, options);
	};

	return new IRequestHandler();
})();
