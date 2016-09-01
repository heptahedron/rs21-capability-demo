import React from 'react'

import PieChart from '../pie-chart/component'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const pieChart = this.props.data ? (
            <PieChart
              diameter={150} 
              sectorWidth={0}
              data={this.props.data.properties.placeTypes}
              className={styles.placeChart} />
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
