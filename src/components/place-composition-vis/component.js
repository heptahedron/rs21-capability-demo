import turf from 'turf'

import LightComponent from '../../lib/light-component'
import dom, { svg } from '../../lib/dom-util'
import styles from './styles.css'

export default class PlaceCompositionVis extends LightComponent {
  constructor(map, fbData, initialSearchCoords=null, initialSearchRadius=50) {
    super()
    this.map = map
    this.fbData = fbData
    this.filterTop = 1 // accounts for proliferation of Local Businesses
    this.radius = 150 / 2

    this.svgEl = null
    this.chartEl = null
    this.header = null
    this.innerChartText = null
    this.innerChartSubtext = null
    this.createRoot()

    if (initialSearchCoords) {
      this.updateCompositionVis(
        this.areaAround(
          initialSearchCoords,
          initialSearchRadius))
    }
  }
}
