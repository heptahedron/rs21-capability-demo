import React from 'react'

import { PieChart, Sector } from '../pie-chart/component'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const pieChart = this.props.data ? (
            <PieChart
                size={150} 
                data={this.props.data.properties.placeTypes}
                className={styles.placeChart}>
              <Sector radius={75} innerRadius={75*.75}
                value="nCheckins"
                sorted="nCheckins"
                keyed="typeStr"
                // color="color" />
                />
            </PieChart>
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
