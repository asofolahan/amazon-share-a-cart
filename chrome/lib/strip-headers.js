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
			"https://www.amazon.ca/gp/cart/view.html*",
			"https://www.amazon.co.uk/gp/cart/view.html*",
			"https://www.amazon.fr/gp/cart/view.html*",
			"https://www.amazon.de/gp/cart/view.html*",
			"https://www.amazon.it/gp/cart/view.html*",
			"https://www.amazon.nl/gp/cart/view.html*",
			"https://www.amazon.es/gp/cart/view.html*",
			"https://www.amazon.cn/gp/cart/view.html*",
			"https://www.amazon.in/gp/cart/view.html*",
			"https://www.amazon.co.jp/gp/cart/view.html*",
			"https://www.amazon.com.mx/gp/cart/view.html*",
			"https://www.amazon.com.au/gp/cart/view.html*",
			"https://www.amazon.com.br/gp/cart/view.html*",
			"https://www.amazon.com/gp/aws/cart/add.html*",
			"https://www.amazon.ca/gp/aws/cart/add.html*",
			"https://www.amazon.co.uk/gp/aws/cart/add.html*",
			"https://www.amazon.fr/gp/aws/cart/add.html*",
			"https://www.amazon.de/gp/aws/cart/add.html*",
			"https://www.amazon.it/gp/aws/cart/add.html*",
			"https://www.amazon.nl/gp/aws/cart/add.html*",
			"https://www.amazon.es/gp/aws/cart/add.html*",
			"https://www.amazon.cn/gp/aws/cart/add.html*",
			"https://www.amazon.in/gp/aws/cart/add.html*",
			"https://www.amazon.co.jp/gp/aws/cart/add.html*",
			"https://www.amazon.com.mx/gp/aws/cart/add.html*",
			"https://www.amazon.com.au/gp/aws/cart/add.html*",
			"https://www.amazon.com.br/gp/aws/cart/add.html*"
		]
	},
	['blocking', "responseHeaders"]);
