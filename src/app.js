import mapboxgl from 'mapbox-gl'

import appConfig from './app-config.json'
import styles from './styles/main.css'

import PlaceCompositionVis from './components/place-composition-vis/component'

import tweetData from 'tweets!../data/Twitter_141103.csv'
import fbData from 'fbdata!../data/FacebookPlaces_Albuquerque.csv'
import censusData from '!!censusdata!../data/BernallioCensusBlocks_Joined.json'

function initApp() {
  const { mapboxAccessToken,
          mapConfig } = appConfig,
        appRootElement = document.body,
        mapContainer = document.createElement('div'),
        areaInfoBox = document.createElement('div')

  mapContainer.className = styles.mapContainer
  areaInfoBox.className = styles.areaInfoBox
  appRootElement.appendChild(mapContainer)
  appRootElement.appendChild(areaInfoBox)

  mapboxgl.accessToken = mapboxAccessToken

  const mainMap = new mapboxgl.Map(
          Object.assign({}, mapConfig, { container: mapContainer })),
        awaitMapReady = new Promise((resolve, reject) => {
          // TODO more robust error handling?
          mainMap.on('load', () => resolve(mainMap))
        })

  const awaitFbDataReady = Promise.resolve(fbData)

  awaitMapReady
    .then(map => { addDataLayers(map); return map })

  Promise.all([awaitMapReady, awaitFbDataReady])
    .then(([map, fbData]) => {
      console.log('map and fbData ready')
      const placeCompVis = new PlaceCompositionVis(map, fbData,
                                                   mapConfig.center)
      placeCompVis.mount(areaInfoBox)
      placeCompVis.addClickInteractivity()
    })
}

function addDataLayers(map) {
  map.addSource('censusData', {
    type: 'geojson',
    data: censusData
  })

  map.addLayer({
    id: 'age',
    source: 'censusData',
    type: 'fill',
    paint: {
      'fill-opacity': 0.5,
      'fill-color': {
        property: 'medianAge',
        stops: [[0, '#fff'], [100, '#000']]
      }
    }
  })

  map.addSource('fbplaces', {
    type: 'geojson',
    data: fbData
  })

  map.addLayer({
    id: 'checkinMagnitude',
    source: 'fbplaces',
    type: 'circle',
    paint: {
      'circle-radius': {
        property: 'nCheckins',
        stops: [
          [0, 5],
          [500, 10]
        ]
      },
      'circle-opacity': .4
    }
  })

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
