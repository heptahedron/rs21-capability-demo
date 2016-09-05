import React from 'react'

import Chart from '../chart/component'
import { PieChart, Sector } from '../pie-chart/component'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  constructor(props) {
    super(props)
  }

  makeChart() {
    if (!this.props.data) {
      return null
    }

    const radius = 75,
          sector = <Sector radius={radius} innerRadius={radius*3/4} />

    return (
      <PieChart
          width={radius*2} height={radius*2}
          data={this.props.data.properties.placeTypes}
          valued="nCheckins"
          sorted="nCheckins"
          keyed="typeStr"
          sector={sector}
          className={styles.placeChart} />
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
