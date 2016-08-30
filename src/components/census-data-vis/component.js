import React from 'react'

import styles from './styles.css'

export default class CensusDataVis extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        census data vis
      </div>
    )
  }
}

/*
class CensusDataVis {
  constructor(map, censusData) {
    super()
    this.map = map
    this.censusData = censusData
    const alpha = 0.25,
          grey = `rgba(0,0,0,${alpha})`
    this.layers = [
      {
        layerName: 'Median Age',
        prop: 'medianAge',
        stops: [
          [0, `rgba(255,255,0,${alpha+0.5})`],
          [100, grey]
        ]
      },
      {
        layerName: 'Population Density',
        prop: 'populationDensity',
        stops: [
          [-4, grey],
          [-1, `rgba(255,0,0,${alpha+0.5})`]
        ]
      },
      {
        layerName: '% income-earning',
        prop: 'fracEarning',
        stops: [
          [0, grey],
          [1, `rgba(0,255,0,${alpha+0.5})`]
        ]
      }
    ]

    this.currentLayer = null

    map.addSource('censusData', {
      type: 'geojson',
      data: censusData
    })

    this.layers.forEach(({ prop, stops }) => {
      map.addLayer({
        id: prop,
        source: 'censusData',
        type: 'fill',
        layout: {
          visibility: 'none'
        },
        paint: {
          'fill-color': {
            property: prop,
            stops
          }
        }
      })
    })

    this.setCurrentLayer(0)
    this.createRoot()
  }

  setCurrentLayer(l) {
    if (this.currentLayer !== null) {
      this.map.setLayoutProperty(this.layers[this.currentLayer].prop,
                                 'visibility',
                                 'none')
    }

    this.map.setLayoutProperty(this.layers[l].prop,
                               'visibility',
                               'visible')
    this.currentLayer = l
  }

  createRoot() {
    this.layerSelector = dom('select', {},
      ...(this.layers.map(({ layerName, prop }, i) => {
        const newOption = dom('option', { value: i }, dom.text(layerName))
        return newOption
      })))
    this.layerSelector.onchange = 
      (({ target: { value: l } }) => this.setCurrentLayer(l))

    this.rootEl = dom('div', { className: styles.container },
      dom('h3', { className: styles.header }, dom.text('Nearby people')),
      this.layerSelector)
  }
}
*/
