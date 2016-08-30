import React from 'react'

import styles from './styles.css'

export default class FbPlaceVis extends React.Component {
  render() {
    return (
      <div className={styles.container}>
        { this.props.map ? 'waiting on map...' : 'fb data vis' }
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.map && nextProps.map) {

    }
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

export const layers = {
  checkinMagnitude: {
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
  }
}
