var CompressionHandlerFactory = require('./compression-handler-factory');

module.exports = (function () {
	'use strict';

	function ICompressionHandler (config) {
		config = config || {};

		this.compressionHandlerFactory = new CompressionHandlerFactory(config);
	}

	ICompressionHandler.prototype.stream = function (encodingType) {
		if (typeof encodingType !== 'string' || !encodingType.length) {
			return null;
		}

		var handler = this.compressionHandlerFactory.getHandler(encodingType);

		if (handler === null) {
			return null;
		}

		return handler.stream();
	};

	return ICompressionHandler;
})();
