# Rationale

## Tools used

### ES6 (via Babel)

Though the new standard of JavaScript is slowly being adopted by modern browsers, many pieces of functionality are still missing or broken. Babel glosses over (*most* of)these incompatibilities by transforming new syntax into valid ES5 and polyfilling functions where it can.

### Mapbox GL JS

Some light research posed Mapbox GL JS and Leaflet as two viable options for displaying the map onto which the visualizations would be superimposed. Looking at their respective APIs, Mapbox seemed a better choice, as it had a much greater breadth and depth of functionality. Were the map not the focal point of the app, Leaflet would have likely won out, as its API does seem much cleaner, at the expense of some power.
