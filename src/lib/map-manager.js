import mapboxgl from 'mapbox-gl'
import '../styles/vendor/mapbox-gl.css'

import styles from '../styles/map-manager.css'

export default class MapManager {
  constructor() {
    this.initialized = false
    this.container = document.createElement('div')
    this.container.className = styles.mapContainer
    this._map = null
    this._mapPromise = null
  }

  init(options) {
    if (!this.constructor.accessToken) {
      throw this.constructor.TOKEN_REQUIRED
    }

    options.mountPoint.appendChild(this.container)

    const mapConfig = Object.assign(
      {}, this.constructor.defaultOptions, options, {
        container: this.container
      })
    this._map = new mapboxgl.Map(mapConfig)
    this._mapPromise = new Promise((resolve, reject) => {
      // no error handling! living life on the edge. wowie
      this._map.on('load', () => resolve(this._map))
    })

    this.initialized = true
  }

  getMap() {
    if (!this.initialized) {
      throw this.constructor.INIT_REQUIRED
    }

    return this._mapPromise
  }

  static setAccessToken(accessToken) {
    this.accessToken = mapboxgl.accessToken = accessToken
  }
}

MapManager.accessToken = null
MapManager.INIT_REQUIRED = "MapManager must be initialized prior to getMap()!"
MapManager.TOKEN_REQUIRED = "Must provide access token "
                            + "before initializing map manager!"
MapManager.defaultOptions = {
  style: 'mapbox://styles/mapbox/streets-v9',
  zoom: 9
}
