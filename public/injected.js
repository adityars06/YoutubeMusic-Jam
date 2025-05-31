(function () {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;


  XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
    this._url = url;
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this._url && this._url.includes("heartbeat")) {
      try {
        const parsedBody = JSON.parse(body);
        const videoId = parsedBody?.videoId;

        if (videoId) {
          window.postMessage({
            source: "ytm-sniffer",
            payload: {
              videoId,
              full: parsedBody
            }
          }, "*");
        }

      } catch (e) {
        console.warn("Parsing error", e);
      }
    }

    return originalSend.apply(this, arguments);
  };
})();

