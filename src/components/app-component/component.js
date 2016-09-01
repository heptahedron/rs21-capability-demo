import React from 'react'
import turf from 'turf'

import { observe,
         mapPairs,
         shallowClone,
         transformProps,
         acceptKeys } from '../../lib/func-util'

import MapboxGl from '../mapbox-gl/component'
import FbPlaceVis from '../fb-place-vis/component'
import CensusDataVis from '../census-data-vis/component'
import TweetsVis from '../tweets-vis/component'

import { searchLayer } from './map-layers'
import styles from './styles.css'

export default class AppComponent extends React.Component {
  constructor(props) {
    super(props)

    const { config: { mapConfig: { initialView: { center } } } } = this.props,
          searchArea = this.areaAround(center, 10)

    this.state = { 
      _map: null,
      sources: {
        /*searchArea: {
          data: searchArea,
          layers: { searchLayer }
        }*/
      }
    }
  }

  updateSource(sourceId, source) {
    const updatedSources = shallowClone(this.state.sources, {
      [sourceId]: source
    })

    this.setState({ sources: updatedSources })
  }

  componentWillMount() {
    const fmt = /^await([A-Z])(.*)/,
          canonical = str =>
            str.replace(fmt, (_, f, rest) => f.toLowerCase() + rest),
          sourcePromises = mapPairs(this.props.sources,
            ([key, source]) => [canonical(key), source])

    sourcePromises.forEach(([sourceId, awaitSource]) => {
      awaitSource.then(source => {
        this.updateSource(sourceId, source)
      })
    })
  }

  handleMapReady(_map) {
    this._map = _map
  }

  handleMapClick(e) {
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

  getData() {
    return Object.keys(this.state.sources)
            .filter(sourceId => sourceId.endsWith('Data'))
            .map(sourceId => 
              ({ [sourceId]: this.state.sources[sourceId].data }))
            .reduce((o1, o2) => Object.assign(o1, o2), {})
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
          { sources } = this.state,
          { fbData,
            twitterData,
            censusData } = this.getData()

    return (
      <div className={styles.appContainer}>
      {/*
        <MapboxGl
          accessToken={accessToken}
          initialView={initialView}
          sources={sources}
          style={mapStyle}
          onMapReady={_map => this.handleMapReady(_map)}
          onClick={e => this.handleMapClick(e)}
          ref={ref => window.mapboxglcomponent = ref}/>*/}
        <div className={styles.visBox}>
          <ul className={styles.visList}>
            <li>
              <FbPlaceVis
                data={fbData} />
            </li>
            <li>
              <CensusDataVis
                data={censusData} />
            </li>
            <li>
              <TweetsVis
                data={twitterData} />
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
