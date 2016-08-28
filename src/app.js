import MapManager from './lib/map-manager'
import appConfig from './app-config.json'
import './styles/main.css'

// import tweetData from 'tweets!../data/Twitter_141103.csv'
// import fbData from 'fbdata!../data/FacebookPlaces_Albuquerque.csv'
import censusData from '!!censusdata!../data/BernallioCensusBlocks_Joined.json'

console.log(censusData)

function initApp() {
  const { mapboxAccessToken,
          mapboxStyleUrl,
          initialView: { center, zoom } } = appConfig

  MapManager.setAccessToken(mapboxAccessToken)

  let map = new MapManager()
  map.init({
    mountPoint: document.body,
    style: mapboxStyleUrl,
    center, zoom
  })

  map.getMap().then(map => {
    /*
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
        'circle-color': {
          property: 'typeNum',
          stops: [
            [0, '#00f'],
            [80, '#f00']
          ]
        },
        'circle-opacity': .4
      }
    })

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
  })
}

document.addEventListener('DOMContentLoaded', initApp)
