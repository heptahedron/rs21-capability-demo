import React from 'react'

// superclass for components that maintain layers on a given map
// using non-shared data
export default class MapboxGlVis extends React.Component {
  constructor(props) {
    super(props)

    if (this.props._map && this.props.data) {
      this.addMapSource(this.props._map, this.props.data)
      this.addMapLayers(this.props._map)
    }

    if (this.constructor === MapboxGlVis) {
      throw 'MapboxGlVis should not be instantiated directly!'
    }
  }

  addMapSource(_map, data) {
    // TODO possibly keep a static map from mapboxgl.Map instances
    // to a map from data sources to integers to maintain ref count
    // (since MapboxGlVis instances are not necessarily the exclusive
    // owner of the data/Map)
    _map.addSource(this.sourceId, {
      type: 'geojson',
      data
    })
  }

  removeMapSource(_map) {
    _map.removeSource(this.sourceId)
  }

  addMapLayers(_map) {
    this.layers.forEach(layer => {
      _map.addLayer(layer)
    })
  }

  removeMapLayers(_map) {
    this.layers.forEach(({ id }) => {
      _map.removeLayer(id)
    })
  }

  componentWillReceiveProps(nextProps) {
    const oldData = this.props.data,
          newData = nextProps.data,
          sameData = oldData === newData,
          refreshing = newData && !sameData,
          oldMap = this.props._map,
          newMap = nextProps._map,
          sameMap = oldMap === newMap

    if (!sameMap) {
      if (oldMap && oldData) {
        this.removeMapLayers(oldMap)
        this.removeMapSource(oldMap)
      }
      
      if (newMap && newData) {
        this.addMapSource(newMap, newData)
        this.addMapLayers(newMap)
      }
    } else if (!sameData && this.props._map) { 
      // we have a map, just losing/getting/changing data
      if (oldData && newData) { // changing
        this.props._map.getSource(this.sourceId).setData(newData)
      } else if (newData) {     // getting
        this.addMapSource(this.props._map, newData)
        this.addMapLayers(this.props._map)
      } else {                  // losing
        this.removeMapLayers(this.props._map)
        this.removeMapSource(this.props._map)
      }
    }
  }
  
  render() {
    throw 'MapboxGlVis#render() is abstract!'
  }
}
