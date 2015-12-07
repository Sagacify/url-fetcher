var RequestHandler = require('./request-handler');

module.exports = (function () {
	'use strict';

	function IRequestHandler (config) {
		config = config || {};

		this.requestHandler = new RequestHandler(config);
	}

	IRequestHandler.prototype.stream = function (url, options) {
		options = options || {};

		if (typeof url !== 'string' || !url.length) {
			return null;
		}

		if (typeof options !== 'object') {
			return null;
		}

		return this.requestHandler.stream(url, options);
	};

	return IRequestHandler;
})();
