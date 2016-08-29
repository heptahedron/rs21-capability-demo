import mapboxgl from 'mapbox-gl'

import dom from './lib/dom-util'
import appConfig from './app-config.json'
import styles from './styles/main.css'

import PlaceCompositionVis from './components/place-composition-vis/component'
import CensusDataVis from './components/census-data-vis/component'

// import tweetData from 'tweets!../data/Twitter_141103.csv'

const helpText = `
Click anywhere on the map to see the types of Facebook places within a 1km
radius. Each black circle represents one such place, and their size indicate
the relative number of people who have checked in at that place. Selecting
an option under 'Nearby people' will color the map more intensely in areas
where the measure is higher.
`.replace('\n', '')

function initApp() {
  const { mapboxAccessToken,
          mapConfig } = appConfig,
        appRootElement = document.body,
        mapContainer = document.createElement('div'),
        areaInfoBox = document.createElement('div'),
        visualizations = dom('ul', { className: styles.visList })

  mapContainer.className = styles.mapContainer
  areaInfoBox.className = styles.areaInfoBox
  dom.append(areaInfoBox, dom('p', { className: styles.helpText },
                                dom.text(helpText)))
  appRootElement.appendChild(mapContainer)
  appRootElement.appendChild(areaInfoBox)
  dom.append(areaInfoBox, visualizations)

  mapboxgl.accessToken = mapboxAccessToken

  const mainMap         = new mapboxgl.Map(
          Object.assign({}, mapConfig, { container: mapContainer })),
        awaitMapReady   = new Promise((resolve, reject) => {
          // TODO more robust error handling?
          mainMap.on('load', () => resolve(mainMap))
        }),
        awaitFbData     = new Promise((resolve, reject) => {
          require(['fbdata!../data/FacebookPlaces_Albuquerque.csv'],
            data => resolve(data))
        }),
        awaitCensusData = new Promise((resolve, reject) => {
          require(['!!censusdata!../data/BernallioCensusBlocks_Joined.json'],
            data => resolve(data))
        })

  Promise.all([awaitMapReady, awaitFbData, awaitCensusData])
    .then(([map, fbData, censusData]) => {
      const censusDataVis = new CensusDataVis(map, censusData),
            cdvMountPoint = dom('li')
      dom.append(visualizations, cdvMountPoint)
      censusDataVis.mount(cdvMountPoint)
      // censusDataVis.addClickInteractivity()
  
      const placeCompVis = new PlaceCompositionVis(map, fbData,
                                                   mapConfig.center),
            pcvMountPoint = dom('li')
      dom.append(visualizations, pcvMountPoint)
      placeCompVis.mount(pcvMountPoint)
      placeCompVis.addClickInteractivity()
    })
}

function addDataLayers(map) {
  /*
  map.addSource('tweets', {
    type: 'geojson',
    data: tweetData
  })

  map.addLayer({
    id: 'tweets',
    source: 'tweets',
    type: 'circle',
    paint: {
      'circle-radius': 5,
      'circle-color': {
        property: 'hour',
        stops: [[0, '#000'], [12, '#ff0'], [23.99, '#000']]
      }
    }
  })
  */
}

document.addEventListener('DOMContentLoaded', initApp)
