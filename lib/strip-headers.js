// webRequest stuff: stripping x-frame-options.
chrome.webRequest.onHeadersReceived.addListener(
	function stripHeaders(req) {
		for (var i = 0; i < req.responseHeaders.length; ++i) {
			if (req.responseHeaders[i].name.toLowerCase() === 'x-frame-options') {
				req.responseHeaders.splice(i, 1);
				break;
			}
		}

		return {responseHeaders: req.responseHeaders};
	},
	{
		urls: [
			"https://www.amazon.com/gp/cart/view.html*",
			"https://www.amazon.com/gp/aws/cart/add.html*"
		]
	},
	['blocking', "responseHeaders"]);
