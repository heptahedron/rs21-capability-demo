import turf from 'turf'

import MapManager from './lib/map-manager'
import appConfig from './app-config.json'
import './styles/main.css'

import tweetData from 'tweets!../data/Twitter_141103.csv'
import fbData from 'fbdata!../data/FacebookPlaces_Albuquerque.csv'
import censusData from '!!censusdata!../data/BernallioCensusBlocks_Joined.json'

console.log(censusData)

function initApp() {
  const { mapboxAccessToken,
          mapboxStyleUrl,
          initialView: { center, zoom } } = appConfig

  MapManager.setAccessToken(mapboxAccessToken)

  let mapManager = new MapManager()
  mapManager.init({
    mountPoint: document.body,
    style: mapboxStyleUrl,
    center, zoom
  })

  mapManager.getMap().then(map => {
    map.addSource('censusData', {
      type: 'geojson',
      data: censusData
    })

    map.addSource('fbplaces', {
      type: 'geojson',
      data: fbData
    })

    map.addSource('tweets', {
      type: 'geojson',
      data: tweetData
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

    // map.on('click', )
  })
}

document.addEventListener('DOMContentLoaded', initApp)
