import React from 'react'

import Chart from '../chart/component'
import { PieChart, Sectors } from '../pie-chart/component'

import { observe } from '../../lib/func-util'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  constructor(props) {
    super(props)
    this.sectorDataMap = null
  }

  handleSectorMouseOver(e) {
    console.log(this.sectorDataMap.get(e.target))
  }

  makeChart() {
    if (!this.props.data) {
      return null
    }

    const radius = 75

    return (
      <PieChart
          width={radius*2} height={radius*2}
          data={this.props.data.properties.placeTypes}
          valued={['typeStr', 'nCheckins']}
          className={styles.placeChart}>
        <Sectors
          radii={radius} innerRadii={radius*3/4}
          valued={1}
          sorted={1}
          keyed={0}
          ref={sectors => {
            if (sectors) {
              this.sectorDataMap = sectors.sectorDataMap
            }
          }}
          onMouseOver={e => this.handleSectorMouseOver(e)} />
      </PieChart>
    )
  }

  render() {
    const pieChart = this.makeChart()

    return (
      <div className={styles.container}>
        {pieChart}
      </div>
    )
  }

  addClickInteractivity() {
    this.initSearchLayer()
    this.map.on('click', e => {
      let newSearchArea = this.areaAround(e.lngLat.toArray())
      this.map.getSource('searchArea').setData(newSearchArea)
      this.map.setLayoutProperty('searchArea', 'visibility', 'visible')
      this.updateCompositionVis(newSearchArea)
    })
  }
}
