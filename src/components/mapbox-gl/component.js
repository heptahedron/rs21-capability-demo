import React from 'react'
import mapboxgl from 'mapbox-gl'
import './mapbox-gl.css'

import { and, not, inArr,
         compareObjs, compareKeys, mapPairs } from '../../lib/func-util'

import styles from './styles.css'

export default class MapboxGl extends React.Component {
  constructor(props) {
    super(props)
    this._map = null
    this.mapLoaded = false
    // this.props.sources = { 'sourceId': { layers: { 'layerId': {} }, data: {} } }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.mapLoaded) {
      // map load handler will see most recent props
      return
    }

    const sourceChanges = compareKeys(this.props.sources, nextProps.sources)

    sourceChanges.removed
      .forEach(sourceId => this._map.removeSource(sourceId))

    sourceChanges.kept
      .forEach(sourceId => {
          const curSource = this.props.sources[sourceId],
                nextSource = nextProps.sources[sourceId],
                layerChanges = compareObjs(
                  curSource.layers, nextSource.layers),
                dataChanged = curSource.data !== nextSource.data

        layerChanges.removed
          .forEach(layerId => this.removeSourceLayer(sourceId, layerId))

        layerChanges.changed
          .forEach(layerId => {
            this.removeSourceLayer(sourceId, layerId)
            this.addSourceLayer(sourceId, layerId, nextSource.layers[layerId])
          })

        if (dataChanged) {
          this.setSourceData(sourceId, nextSource.data)
        }

        layerChanges.added
          .forEach(layerId => 
            this.addSourceLayer(sourceId, layerId, nextSource.layers[layerId]))
      })

    sourceChanges.added
      .forEach(sourceId => 
        this.addSource(sourceId, nextProps.sources[sourceId]))
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  addSource(sourceId, source) {
    this._map.addSource(sourceId, { 
      type: 'geojson',
      data: source.data 
    })

    Object.keys(source.layers)
      .forEach(layerId =>
        this.addSourceLayer(sourceId, layerId, source.layers[layerId]))
  }

  removeSource(sourceId) {
    Object.keys(this.props.sources[sourceId].layers)
      .forEach(layerId => this.removeSourceLayer(sourceId, layerId))

    this._map.removeSource(sourceId)
  }

  _layerId(sourceId, layerId) {
    return `${sourceId}#${layerId}`
  }

  addSourceLayer(sourceId, layerId, layer) {
    this._map.addLayer(Object.assign({}, layer, {
      id: this._layerId(sourceId, layerId),
      source: sourceId
    }))
  }

  removeSourceLayer(sourceId, layerId) {
    this._map.removeLayer(this._layerId(sourceId, layerId))
  }

  mountMap(node) {
    const { accessToken, style,
            initialView: { center, zoom } } = this.props
    
    node.textContent = ''
    mapboxgl.accessToken = accessToken
    this._map = new mapboxgl.Map({
                  container: node,
                  style,
                  center,
                  zoom
                })

    this._map.on('load', () => {
      mapPairs(this.props.sources,
        ([sourceId, source]) => this.addSource(sourceId, source))

      this.mapLoaded = true
      this.props.onMapReady(this._map)
    })
  }

  render() {
    return (
      <div className={styles.mapContainer}
          ref={node => this.mountMap(node)}>
      </div>
    )
  }
}
