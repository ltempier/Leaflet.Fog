
Leaflet.fog
==========

Inspired by the game Age of empires this library allows you to hide and show some areas of a map.

![alt text](http://i.imgur.com/Q6hkzMp.jpg "Age of empire map example")


## Basic Usage

```js
var fog = L.fogLayer([
                     	[50.5, 30.5], // lat, lng
                     	[50.6, 30.4],
                     	...
                     ]).addTo(map);
```

To include the plugin, just use `leaflet-fog.js` from the `dist` folder:

```html
<script src="leaflet-fog.js"></script>
```

## Building
To build the dist files run:
```npm install && npm run prepublish```

