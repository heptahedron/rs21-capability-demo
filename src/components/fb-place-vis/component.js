import React from 'react'

import PieChartSvg from '../pie-chart-svg/component'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  constructor(props) {
    super(props)
  }

  getData() {
    return (this.props.fbData.properties.placeTypes
      .map(placeType => placeType[nCheckins]))
  }

  getTypeColor(typeNum) {
    return this.props.fbData.properties.placeTypes[typeNum].color
  }

  render() {
    const sideLength = 150,
          pieChart = this.props.fbData ? (
            <svg width={sideLength} height={sideLength}>
              <PieChart data={this.getData()} sideLength={sideLength} />
            </svg>
          ) : null

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
