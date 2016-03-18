(function () {
    'use strict';
    function simplefog(canvas) {

        if (!(this instanceof simplefog)) {
            return new simplefog(canvas);
        }

        this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

        this._ctx = canvas.getContext('2d');

        this._width = canvas.width;
        this._height = canvas.height;
        this._size = 100;

        this.clear();
    }

    simplefog.prototype = {

        data: function (data) {
            this._data = data;
            return this;
        },
        clear: function () {
            this._data = [];
            return this;
        },

        getPattern: function (zoom) {
            var pattern = this._pattern = document.createElement('canvas'),
                ctx = pattern.getContext('2d'),
                cornerRadius = this._size / 5;

            //ctx.lineJoin = "round";
            //ctx.lineWidth = cornerRadius;

            ctx.beginPath();

            ctx.moveTo(0, 0);
            ctx.lineTo(0, this._size);
            ctx.lineTo(this._size, this._size);
            ctx.lineTo(this._size, 0);
            ctx.lineTo(0, 0);

            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            return this;
        },

        draw: function () {
            if (!this._pattern)
                this.getPattern();
            var ctx = this._ctx;
            ctx.clearRect(0, 0, this._width, this._height);
            for (var i = 0, len = this._data.length, p; i < len; i++) {
                p = this._data[i];
                ctx.drawImage(this._pattern, p[0] - this._size / 2, p[1] - this._size / 2);
            }

            ctx.globalCompositeOperation = 'xor';
            ctx.fillRect(0, 0, this._width, this._height);
            ctx.globalCompositeOperation = 'source-over';
            return this;
        }
    };


    window.simplefog = simplefog;
})();


