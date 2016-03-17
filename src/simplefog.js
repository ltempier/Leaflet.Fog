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
        this._size = 5;

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
        draw: function () {
            var ctx = this._ctx;
            ctx.clearRect(0, 0, this._width, this._height);

            for (var i = 0, len = this._data.length, p; i < len; i++) {
                p = this._data[i];
                ctx.strokeStyle = this.getRandomColor();
                ctx.strokeRect(
                    p[0] - this._size,
                    p[1] - this._size,
                    p[0] + this._size,
                    p[1] + this._size);
            }

            return this;
        },

        getRandomColor: function () {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    };


    window.simplefog = simplefog;
})();


