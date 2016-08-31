import React from 'react'

import PieChartSvg from '../pie-chart-svg/component'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  constructor(props) {
    super(props)
  }

  getData() {
    return this.props.data.properties.placeTypes
  }

  getTypeColor(typeNum) {
    return this.props.data.properties.placeTypes[typeNum].color
  }

  render() {
    const sideLength = 150,
          pieChart = this.props.data ? (
            <svg width={sideLength} height={sideLength}>
              <PieChartSvg
                sideLength={sideLength} 
                data={this.props.data.placeTypes}
                quantity="nCheckins"
                sorted="nCheckins"
                keyed="typeStr" />
            </svg>
          ) : null

    console.log('pieChart', pieChart, this.props.data)
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
