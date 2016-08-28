import turf from 'turf'

import MapManager from './lib/map-manager'
import appConfig from './app-config.json'
import './styles/main.css'

import tweetData from 'tweets!../data/Twitter_141103.csv'
import fbData from 'fbdata!../data/FacebookPlaces_Albuquerque.csv'
import censusData from '!!censusdata!../data/BernallioCensusBlocks_Joined.json'

console.log(fbData)
console.log(censusData)

function initApp() {
  const { mapboxAccessToken,
          mapboxStyleUrl,
          initialView: { center, zoom } } = appConfig

  let searchArea = turf.featureCollection(
    [turf.buffer(turf.point(center), 1)])

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

    map.addSource('searchArea', { type: 'geojson', data: searchArea })
    map.addLayer({
      id: 'searchArea',
      source: 'searchArea',
      type: 'fill',
      layout: {
        'visibility': 'none'
      },
      paint: {
        'fill-color': 'rgba(0,0,255,.3)'
      }
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

    map.on('click', function(e) {
      let newSearchArea = turf.featureCollection(
            [turf.buffer(turf.point(e.lngLat.toArray()), 1)]),
          results = turf.collect(newSearchArea, fbData,
                                 'typeNum', 'placeTypes'),
          placeTypeDist = results.features[0].properties.placeTypes
            .reduce((typeNum, acc) => {
              const { typeStr } = fbData.properties.placeTypes[typeNum]
              if (typeof acc[fbData] === 'undefined') {
                return Object.assign(acc, {
                  [typeStr]: 1
                })
              }

              ++acc[typeStr]
              return acc
            }, {})
      console.log(placeTypeDist)
      map.getSource('searchArea').setData(newSearchArea)
      map.setLayoutProperty('searchArea', 'visibility', 'visible')
    })
  })
}

document.addEventListener('DOMContentLoaded', initApp)
