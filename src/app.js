import MapManager from './lib/map-manager'
import appConfig from './app-config.json'
import './styles/main.css'

import censusData from './data/BernallioCensusBlocks_Joined.json'

// for exploration purposes
Object.assign(window, { censusData })

function initApp() {
  const { mapboxAccessToken,
          mapboxStyleUrl } = appConfig

  MapManager.setAccessToken(mapboxAccessToken)

  let map = new MapManager()
  map.init({
    mountPoint: document.body,
    style: mapboxStyleUrl
  })

  // see above
  Object.assign(window, { map })
}

document.addEventListener('DOMContentLoaded', initApp)
