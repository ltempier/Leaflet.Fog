'use strict';

L.FogLayer = (L.Layer ? L.Layer : L.Class).extend({

    initialize: function (latlngs, options) {
        this._latlngs = latlngs;
        L.setOptions(this, options);
    },

    setLatLngs: function (latlngs) {
        this._latlngs = latlngs;
        return this.redraw();
    },

    addLatLng: function (latlng) {
        this._latlngs.push(latlng);
        return this._redraw();
    },

    addCurrentLatLng: function (latlng) {
        this._currentlatlng = latlng;
        return this._redraw();
    },

    redraw: function () {
        if (this._fog && !this._frame && !this._map._animating) {
            this._frame = L.Util.requestAnimFrame(this._redraw, this);
        }
        return this;
    },

    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    onAdd: function (map) {
        this._map = map;

        if (!this._canvas) {
            this._initCanvas();
        }

        map._panes.overlayPane.appendChild(this._canvas);

        map.on('moveend', this._reset, this);

        if (map.options.zoomAnimation && L.Browser.any3d) {
            map.on('zoomanim', this._animateZoom, this);
        }

        this._reset();
    },
    onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);
        map.off('moveend', this._reset, this);
        if (map.options.zoomAnimation) {
            map.off('zoomanim', this._animateZoom, this);
        }
    },

    _initCanvas: function () {
        var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-fog-layer leaflet-layer');

        var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
        canvas.style[originProp] = '50% 50%';

        var size = this._map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));
    },

    _reset: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._redraw();
    },

    _redraw: function () {
        console.time('_redraw');

        var p,
            size = this._map.getSize(),
            patternSize = 100,
            ctx = this._canvas.getContext('2d');

        ctx.globalCompositeOperation = "source-over";

        var b = this._map.getBounds();
        var d = b._northEast.distanceTo(b._southWest);
        var s = Math.sqrt(Math.pow(size.x, 2) + Math.pow(size.y, 2));
        patternSize = Math.round(patternSize * s / d);

        var pattern = this.getPattern(patternSize),
            bounds = new L.Bounds(
                L.point([-patternSize / 2, -patternSize / 2]),
                size.add([patternSize / 2, patternSize / 2]));

        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (var i = 0, len = this._latlngs.length; i < len; i++) {
            p = this._map.latLngToContainerPoint(this._latlngs[i]);
            if (bounds.contains(p)) {
                ctx.drawImage(pattern, p.x - patternSize / 2, p.y - patternSize / 2);
            }
        }

        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; //change color
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        ctx.globalCompositeOperation = "source-over";

        if (this._currentlatlng) {
            p = this._map.latLngToContainerPoint(this._currentlatlng);
            if (bounds.contains(p)) {
                ctx.drawImage(pattern, p.x - patternSize / 2, p.y - patternSize / 2);
            }
        }

        ctx.globalCompositeOperation = "xor";
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)"; //fog color
        ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        console.timeEnd('_redraw');
    },
    getPattern: function (size) {
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');

        var size5 = Math.round(size / 5);
        var size80 = size - 2 * size5;
        var cornerRadius = 10;

        ctx.lineJoin = "round";
        ctx.lineWidth = cornerRadius;
        var rectX = size5;
        var rectY = 0;
        var rectWidth = size80;
        var rectHeight = size;

        //ctx.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
        //ctx.fillRect(rectX + (cornerRadius), rectY + (cornerRadius), rectWidth - 2 * cornerRadius, rectHeight - 2 * cornerRadius);
        //
        //rectX = 0;
        //rectY = size5;
        //rectWidth = size;
        //rectHeight = size80;
        //
        //ctx.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
        //ctx.fillRect(rectX + (cornerRadius), rectY + (cornerRadius), rectWidth - 2 * cornerRadius, rectHeight - 2 * cornerRadius);

        rectX = 0;
        rectY = 0;
        rectWidth = size;
        rectHeight = size;

        ctx.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
        ctx.fillRect(rectX + (cornerRadius), rectY + (cornerRadius), rectWidth - 2 * cornerRadius, rectHeight - 2 * cornerRadius);

        return canvas;
    },

    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom),
            offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        if (L.DomUtil.setTransform) {
            L.DomUtil.setTransform(this._canvas, offset, scale);

        } else {
            this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
    }
});

L.fogLayer = function (latlngs, options) {
    return new L.FogLayer(latlngs, options);
};
