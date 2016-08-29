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
    
    // add map sources
    map.addSource('fbplaces', {
      type: 'geojson',
      data: fbData
    })

    map.addLayer({
      id: 'checkinMagnitude',
      source: 'fbplaces',
      type: 'circle',
      paint: {
        'circle-radius': {
          property: 'nCheckins',
          stops: [
            [0, 5],
            [500, 10]
          ]
        },
        'circle-opacity': .4
      }
    })
  }

  createRoot() {
    this.chartEl = svg('g')
    this.innerChartText = svg('text', {
      'text-anchor': 'middle',
      'color': 'black',
      'font-family': 'sans-serif',
      'font-weight': 'bold',
      'font-size': '16px',
      x: this.radius, y: this.radius
    }, svg.text(''))
    this.innerChartSubtext = svg('text', {
      'text-anchor': 'middle',
      'color': 'black',
      'font-family': 'sans-serif',
      'font-size': '12px',
      x: this.radius, y: this.radius + 16
    })

    this.svgEl = svg('svg', {
                   width: this.radius * 2,
                   height: this.radius * 2
                 }, 
                  this.chartEl,
                  this.innerChartText,
                  this.innerChartSubtext)
    const hoverStyles = 'path:hover{opacity:0.5}'
    svg.append(this.svgEl, svg('style', {}, dom.text(hoverStyles)))

    this.header = dom('h3', {}, dom.text('Nearby places'))
    this.header.className = styles.header
    this.rootEl = dom('div', {}, this.header, this.svgEl)
    this.rootEl.className = styles.container
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
  placesWithinArea(area) {
    let results = turf.collect(area, this.fbData,
                               'typeNum', 'placeTypes')
    return results
  }

  calcPlaceTypeCounts(areaPlaces) {
    const nPlacesFound = areaPlaces.features[0].properties.placeTypes.length,
          placeTypeCounts = areaPlaces.features[0].properties.placeTypes
            .reduce((acc, typeNum) => {
              if (typeof acc[typeNum] === 'undefined') {
                return Object.assign(acc, {
                  [typeNum]: 1
                })
              }

              ++acc[typeNum]
              return acc
            }, {})

    return { counts: placeTypeCounts, total: nPlacesFound }
  }

  typeDistFromCounts({ total, counts }) {
    let dist = {}
    Object.keys(counts).forEach(typeNum => 
      dist[typeNum] = counts[typeNum] / total)

    return dist
  }

  getTypeStr(typeNum) {
    return this.fbData.properties.placeTypes[typeNum].typeStr
  }

  getTypeColor(typeNum) {
    return this.fbData.properties.placeTypes[typeNum].color
  }

  updateCompositionVis(searchArea) {
    let curOffset = 0,
        radius = this.radius,
        twopi = 2 * Math.PI,
        halfpi = Math.PI/2,
        foundPlaces = this.placesWithinArea(searchArea),
        typeCounts = this.calcPlaceTypeCounts(foundPlaces),
        { counts, total } = typeCounts,
        typeNums = Object.keys(counts),
        placeTypeDist = this.typeDistFromCounts(typeCounts)

    svg.clear(this.chartEl)

    if (typeNums.length === 0) {
      this.setInnerText('None')
      return
    } else if (typeNums.length === 1) {
      svg.append(this.chartEl, svg('circle', {
        cx: radius, cy: radius,
        fill: this.getTypeColor(typeNums[0])
      }))
    } else {
      typeNums
        .map(typeNum => ({
          color: this.getTypeColor(typeNum),
          percent: placeTypeDist[typeNum],
          typeNum
        }))
        .sort(({ percent: a }, { percent: b }) => b - a)
        .map(({ color, percent, typeNum }) => {
          const offset = curOffset
          curOffset += percent

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

          const newPath = svg('path', {
            d: pathStr,
            fill: color
          })

          newPath.onmouseover = () =>
            this.setInnerText(counts[typeNum].toString(),
                              this.getTypeStr(typeNum))
          newPath.onmouseout = () => 
            this.setInnerText(total.toString(), 'total')
          return newPath
        })
        .forEach(svg.append(this.chartEl))
      }

    const thickness = 20,
          innerRadius = radius - thickness * 2

    const whiteFill = svg('circle', {
            cx: radius, cy: radius, r: innerRadius,
            fill: '#fff'
          })

    svg.append(this.chartEl, whiteFill)
    this.setInnerText(total.toString(), 'total')
  }

  setInnerText(text='', subtext='') {
    svg.text(this.innerChartText, text)
    svg.text(this.innerChartSubtext, subtext)
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
