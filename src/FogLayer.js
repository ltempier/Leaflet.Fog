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

    _initCanvas: function () {
        var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-fog-layer leaflet-layer');

        var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
        canvas.style[originProp] = '50% 50%';

        var size = this._map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

        this._fog = simplefog(canvas)
    },

    _reset: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        var size = this._map.getSize();

        if (this._fog._width !== size.x) {
            this._canvas.width = this._fog._width = size.x;
        }
        if (this._fog._height !== size.y) {
            this._canvas.height = this._fog._height = size.y;
        }

        this._redraw();
    },

    _redraw: function () {
        var p,
            size = this._map.getSize(),
            bounds = new L.Bounds(
                L.point([-this._fog._size, -this._fog._size]),
                size.add([this._fog._size, this._fog._size]));

        var data = [];
        for (var i = 0, len = this._latlngs.length; i < len; i++) {
            p = this._map.latLngToContainerPoint(this._latlngs[i]);
            if (bounds.contains(p)) {
                data.push([p.x, p.y])
            }
        }
        this._fog.data(data).draw();
    }
});


L.fogLayer = function (latlngs, options) {
    return new L.FogLayer(latlngs, options);
};
