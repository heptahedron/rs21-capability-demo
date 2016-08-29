import turf from 'turf'

import LightComponent from '../../lib/light-component'
import dom, { svg } from '../../lib/dom-util'
import styles from './styles.css'

export default class PlaceCompositionVis extends LightComponent {
  constructor(map, fbData) {
    super()
    this.map = map
    this.fbData = fbData
    this.filterTop = 1 // accounts for proliferation of Local Businesses
    this.radius = 150 / 2

    this.svgEl = null
    this.header = null
    this.innerChartText = null
    this.createRoot()
  }

  createRoot() {
    this.svgEl = svg('svg', {
                   width: this.radius * 2,
                   height: this.radius * 2
                 })

    this.header = dom('h3', {}, dom.text('Nearby establishments'))
    this.header.className = styles.header
    this.rootEl = dom('div', {}, this.header, this.svgEl)
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
    let results = turf.collect(area, this.fbData,
                               'typeNum', 'placeTypes')

    if (this.filterTop) {
      results.features[0].properties.placeTypes = 
        results.features[0].properties.placeTypes.filter(typeNum => 
          typeNum >= this.filterTop)
    }

    let nPlacesFound = results.features[0].properties.placeTypes.length,
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

  getTypeColor(typeNum) {
    return this.fbData.properties.placeTypes[typeNum].color
  }

  updateCompositionVis(placeTypeDist) {
    let curOffset = 0,
        radius = this.radius,
        twopi = 2 * Math.PI,
        halfpi = Math.PI/2,
        typeNums = Object.keys(placeTypeDist)

    svg.clear(this.svgEl)

    if (typeNums.length === 0) {
      return
    } else if (typeNums.length === 1) {
      svg.append(this.svgEl, svg('circle', {
        cx: radius, cy: radius,
        fill: this.getTypeColor(typeNums[0])
      }))
    } else {
      typeNums
        .map(typeNum => ({
          color: this.getTypeColor(typeNum),
          percent: placeTypeDist[typeNum]
        }))
        .sort(({ percent: a }, { percent: b }) => b - a)
        .map(({ color, percent }) => {
          const offset = curOffset
          curOffset += percent
          return { color, percent, offset }
        })
        .map(({ color, percent, offset }) => {
          const startRads = twopi * offset,
            endRads = twopi * (offset + percent),
            startPoint = [
            1 + Math.cos(startRads),
            1 - Math.sin(startRads)
          ].map(p => p * radius).map(p => p.toFixed(2)),
          endPoint = [
            1 + Math.cos(endRads),
            1 - Math.sin(endRads)
          ].map(p => p * radius).map(p => p.toFixed(2)),
          largeArc = (percent > .5) ? 1 : 0,
            pathStr = [
            `M ${radius} ${radius}`,
            `L ${startPoint.join(' ')}`,
            `A ${radius} ${radius} 0 ${largeArc} 0`,
            `${endPoint.join(' ')} Z`
          ].join(' ')

          return svg('path', {
            d: pathStr,
            fill: color
          })
        })
        .forEach(svg.append(this.svgEl))
      }

    const thickness = 20,
          innerRadius = radius - thickness * 2

    const whiteFill = svg('circle', {
            cx: radius, cy: radius, r: innerRadius,
            fill: '#fff'
          })

    svg.append(this.svgEl, whiteFill)

    const hoverStyles = 'path:hover{opacity:0.5}'
    svg.append(this.svgEl, svg('style', {}, dom.text(hoverStyles)))
    this.innerChartText = svg('text', {
      'text-anchor': 'middle',
      color: 'black',
      'font-family': 'sans',
      x: this.radius, y: this.radius
    }, svg.text(typeNums.length.toString()))
    svg.append(this.svgEl, this.innerChartText)
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
