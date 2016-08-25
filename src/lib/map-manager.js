import mapboxgl from 'mapbox-gl'
import '../styles/vendor/mapbox-gl.css'

import styles from '../styles/map-manager.css'

export default class MapManager {
  constructor() {
    this.container = document.createElement('div')
    this.container.className = styles.mapContainer
    this._map = null
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
  }

  static setAccessToken(accessToken) {
    this.accessToken = mapboxgl.accessToken = accessToken
  }
}

MapManager.accessToken = null
MapManager.TOKEN_REQUIRED = "Must provide access token "
                            + "before initializing map manager!"
MapManager.defaultOptions = {
  style: 'mapbox://styles/mapbox/streets-v9',
  zoom: 6
}
