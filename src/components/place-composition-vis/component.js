import turf from 'turf'

import LightComponent from '../../lib/light-component'
import dom from '../../lib/dom-util'
import styles from './styles.css'

export default class PlaceCompositionVis extends LightComponent {
  constructor(map, fbData) {
    super()
    this.map = map
    this.fbData = fbData
  }

  get rootEl() {
    return this.placeList || (this.placeList = this.createPlaceList())
  }

  set rootEl(el) { this.placeList = el }

  createPlaceList() {
    const placeList = document.createElement('ol'),
          testEl = document.createElement('li')
    placeList.className = styles.placeList
    testEl.textContent = '1st place type'
    placeList.appendChild(testEl)

    return placeList
  }

  initSearchLayer() {
    let searchArea = turf.featureCollection(
      [turf.buffer(turf.point([0,0]), 1)])

    this.map.addSource('searchArea', { type: 'geojson', data: searchArea })
    this.map.addLayer({
      id: 'searchArea',
      source: 'searchArea',
      type: 'fill',
      layout: {
        'visibility': 'none'
      },
      paint: {
        'fill-color': 'rgba(0,0,255,.3)'
      }
    })
  }

  areaAround([lng, lat], radius=1) {
    return turf.featureCollection(
      [turf.buffer(turf.point([lng, lat]), radius)])
  }

  // mutates area feature properties
  calcAreaPlaceTypeDist(area) {
    const results = turf.collect(area, this.fbData,
                                 'typeNum', 'placeTypes'),
          nPlacesFound = results.features[0].properties.placeTypes.length,
          placeTypeDist = results.features[0].properties.placeTypes
            .reduce((acc, typeNum) => {
              if (typeof acc[typeNum] === 'undefined') {
                return Object.assign(acc, {
                  [typeNum]: 1/nPlacesFound
                })
              }

              acc[typeNum] += 1/nPlacesFound
              return acc
            }, {})

    return placeTypeDist
  }

  getTypeStr(typeNum) {
    return this.fbData.properties.placeTypes[typeNum].typeStr
  }

  updateCompositionVis(placeTypeDist) {
    dom.children(this.placeList, Object.keys(placeTypeDist)
      .map(typeNum => ({
        typeStr: this.getTypeStr(typeNum),
        numPlaces: placeTypeDist[typeNum]
      }))
      .map(({ typeStr, numPlaces }) => 
        dom.text(dom('li'), `${typeStr}: ${numPlaces}`)))
  }

  addClickInteractivity() {
    this.initSearchLayer()
    this.map.on('click', e => {
      let newSearchArea = this.areaAround(e.lngLat.toArray()),
          placeTypeDist = this.calcAreaPlaceTypeDist(newSearchArea)
      this.map.getSource('searchArea').setData(newSearchArea)
      this.map.setLayoutProperty('searchArea', 'visibility', 'visible')
      this.updateCompositionVis(placeTypeDist)
    })
  }
}
