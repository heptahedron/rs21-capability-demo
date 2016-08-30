import React from 'react'
import mapboxgl from 'mapbox-gl'
import './mapbox-gl.css'

import { and, not, inArr } from '../../lib/func-util'

import styles from './styles.css'

export default class MapboxGl extends React.Component {
  constructor(props) {
    super(props)
    this._map = null
    this.mapLoaded = false
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    if (!this.mapLoaded) {
      // map load handler will see most recent props
      return
    }

    // assumes programmer smart enough to remove layers before their sources
    const curSourceIds = Object.keys(this.props.sources),
          newSourceIds = Object.keys(nextProps.sources),
          leavingSourceIds = curSourceIds.filter(not(inArr(newSourceIds))),
          leavingLayers = this.props.layers
            .filter(not(inArr(nextProps.layers))),
          comingSourceIds = newSourceIds.filter(not(inArr(curSourceIds))),
          comingLayers = nextProps.layers
            .filter(not(inArr(this.props.layers))),
          dataUpdated = sourceId => 
            this.props.sources[sourceId] !== nextProps.sources[sourceId],
          updatedSourceIds = curSourceIds
            .filter(and(inArr(newSourceIds), dataUpdated))

    updatedSourceIds.forEach(sourceId =>
      this._map.getSource(sourceId).setData(nextProps.sources[sourceId]))
    leavingLayers.forEach(layer => this._map.removeLayer(layer.id))
    leavingSourceIds.forEach(sourceId => this._map.removeSource(sourceId))
    comingSourceIds.forEach(
      sourceId => this._map.addSource(sourceId, nextProps.sources[sourceId]))
    comingLayers.forEach(
      layer => this._map.addLayer(layer))
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
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
      Object.keys(this.props.sources).forEach(sourceId => {
        this._map.addSource(sourceId, {
          type: 'geojson',
          data: this.props.sources[sourceId]
        })
      })
      this.props.layers.forEach(layer => this._map.addLayer(layer)) 
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
