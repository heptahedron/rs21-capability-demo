import React from 'react'
import turf from 'turf'

import MapboxGl from '../mapbox-gl/component'
import FbPlaceVis, { 
         makeLayers as makeFbDataLayers
       } from '../fb-place-vis/component'
import CensusDataVis from '../census-data-vis/component'
import TweetsVis from '../tweets-vis/component'

import styles from './styles.css'

const HELP_TEXT = `
Click anywhere on the map to see the types of Facebook places within a 1km
radius. Each black circle represents one such place, and their size indicate
the relative number of people who have checked in at that place. Selecting
an option under 'Nearby people' will color the map more intensely in areas
where the measure is higher.
`.replace('\n', '')

export default class AppComponent extends React.Component {
  constructor(props) {
    super(props)

    const searchLayer = {
            id: 'searchArea',
            source: 'searchArea',
            type: 'fill',
            layout: {
              'visibility': 'none'
            },
            paint: {
              'fill-color': 'rgba(0,0,255,.3)'
            }
          },
          { config: { mapConfig: { initialView: { center } } } } = this.props

    this.state = { 
      _map: null,
      fbData: null,
      censusData: null,
      tweetData: null,
      searchArea: this.areaAround(center, 10),
      layers: [searchLayer]
    }
  }

  componentWillMount() {
    const { awaitFbData, awaitCensusData, awaitTweetData } = this.props.data
    awaitFbData.then(fbData => {
      const newLayers = this.state.layers
        .concat(makeFbDataLayers('fbData'))
      this.setState(
        { fbData, layers: newLayers })
    })
    awaitCensusData.then(censusData => {
      /*
      const newLayers = this.state.layers
        .concat(censusDataLayers('censusData'))
      this.setState({ censusData, layers: newLayers })
      */
      this.setState({ censusData })
    })
    awaitTweetData.then(tweetData => {
      /*
      const newLayers = this.state.layers
        .concat(tweetDataLayers('tweetData'))
      this.setState({ tweetData, layers: newLayers })
      */
      this.setState({ tweetData })
    })
  }

  getSources() {
    const keys = ['fbData', 'twitterData', 'censusData', 'searchArea'],
          sources = keys
            .filter(k => this.state[k])
            .map(k => ({ [k]: this.state[k] }))
            .reduce((o1, o2) => { Object.assign(o1, o2) })
    
    return sources
  }

  handleMapReady(_map) {
    this._map = _map
  }

  areaAround([lng, lat], radius=1) {
    return turf.featureCollection(
      [turf.buffer(turf.point([lng, lat]), radius)])
  }

  // mutates area feature properties
  placesWithinArea(area) {
    let results = turf.collect(area, this.fbData,
                               'typeNum', 'placeTypes')
    return results
  }

  calcPlaceTypeCounts(areaPlaces) {
    const nPlacesFound = areaPlaces.features[0].properties.placeTypes.length,
          placeTypeCounts = areaPlaces.features[0].properties.placeTypes
            .reduce((acc, typeNum) => {
              if (typeof acc[typeNum] === 'undefined') {
                return Object.assign(acc, {
                  [typeNum]: 1
                })
              }

              ++acc[typeNum]
              return acc
            }, {})

    return { counts: placeTypeCounts, total: nPlacesFound }
  }

  typeDistFromCounts({ total, counts }) {
    let dist = {}
    Object.keys(counts).forEach(typeNum => 
      dist[typeNum] = counts[typeNum] / total)

    return dist
  }

  getTypeStr(typeNum) {
    return this.fbData.properties.placeTypes[typeNum].typeStr
  }

  getTypeColor(typeNum) {
    return this.fbData.properties.placeTypes[typeNum].color
  }

  render() {
    const {
            config: {
              mapConfig: {
                accessToken,
                initialView,
                style: mapStyle 
              }
            }
          } = this.props,
          sources = this.getSources(),
          layers = this.state.layers

    return (
      <div className={styles.appContainer}>
        <MapboxGl
          accessToken={accessToken}
          initialView={initialView}
          sources={sources}
          layers={layers}
          style={mapStyle}
          onMapReady={_map => this.handleMapReady(_map)} />
        <div className={styles.visBox}>
          <p className={styles.helpText}>{HELP_TEXT}</p>
          <ul className={styles.visList}>
            <li>
              <FbPlaceVis
                data={this.state.fbData}
                _map={this._map} />
            </li>
            <li>
              <CensusDataVis
                data={this.state.censusData}
                _map={this._map} />
            </li>
            <li>
              <TweetsVis
                data={this.state.tweetData}
                _map={this._map} />
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
