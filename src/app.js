import mapboxgl from 'mapbox-gl'
import './styles/mapbox-gl.css'

import './styles/main.css'
import appConfig from './app-config.json'

document.addEventListener('DOMContentLoaded', () => {
  const mapMountPoint = document.createElement('div'),
        { mapboxAccessToken,
          mapboxStyleUrl } = appConfig

  document.body.appendChild(mapMountPoint)
  mapboxgl.accessToken = mapboxAccessToken

  let map = new mapboxgl.Map({
    container: mapMountPoint,
    style: mapboxStyleUrl
  })
})
