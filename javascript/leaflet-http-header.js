
'use strict';

//import * as Util from "./leaflet/src/core/Util.js";
//import * as DomUtil from "./leaflet/src/dom/DomUtil.js";

async function fetchImage(url, callback, headers, abort, requests) {
  let _headers = {};
  if (headers) {
    headers.forEach(h => {
      _headers[h.header] = h.value;
    });
  }
  const controller = new AbortController();
  const signal = controller.signal;
  if (abort) {
    abort.subscribe(() => {
      controller.abort();
    });
  }

  const request = {
    url,
    controller
  };
  requests.push(request);


/*
  fetch(url, {
    method: "GET",
    headers: _headers,
    mode: "cors",
    signal: signal
  }).then(async f => {
    const blob = await f.blob();
    callback(blob);
  });
*/

fetch(url, {
  method: "GET",
  headers: _headers,
  mode: "cors",
  signal: signal
}).then(async f => {
  if (f.ok) {
      const blob = await f.blob();
      callback(blob);
  } else {
      // Handle other HTTP errors here if needed
      //console.error('Error fetching image:', f.status);
      var silent1;
  }
}).catch(error => {
  if (error.name === 'AbortError') {
    var silent2;
      //console.log('Fetch request aborted');
  } else {
      //console.error('Fetch request failed:', error);
      var silent3;
  }
});



}

L.TileLayer.WMSHeader = L.TileLayer.WMS.extend({
  initialize: function (url, options, headers, abort) {
    L.TileLayer.WMS.prototype.initialize.call(this, url, options);
    this.headers = headers;
    this.abort = abort;
    this.requests = [];
  },
  createTile(coords, done) {
    const url = this.getTileUrl(coords);
    const img = document.createElement("img");
    img.setAttribute("role", "presentation");
    img.setAttribute("data-url", url);

    fetchImage(
      url,
      resp => {
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result;
        };
        reader.readAsDataURL(resp);
        done(null, img);
      },
      this.headers,
      this.abort,
      this.requests
    );
    return img;
  },
  _abortLoading: function() {
    for (const i in this._tiles) {
      if (this._tiles[i].coords.z !== this._tileZoom) {
        const tile = this._tiles[i].el;

        tile.onload = function() {return false;};
        tile.onerror = function() {return false;};

        const url = tile.getAttribute("data-url");
        const j = this.requests.findIndex(r => r && r.url === url);
        if (j >= 0) {
          this.requests[j].controller.abort();

          tile.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
          //DomUtil.remove(tile);
          delete this._tiles[i];
          delete this.requests[j];
        }
      }
    }
  }
});

L.TileLayer.wmsHeader = function (url, options, headers, abort) {
  return new L.TileLayer.WMSHeader(url, options, headers, abort);
};