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
    const diameter = 150,
          pieChart = this.props.data ? (
            <PieChartSvg
              diameter={diameter} 
              innerRadius={0}
              data={this.props.data.properties.placeTypes}
              quantity="nCheckins"
              sorted="nCheckins" descending
              keyed="typeStr" />
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
