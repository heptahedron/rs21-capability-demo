import { vec } from '../../lib/matrix-util'

import React from 'react'

export default class PieChartSvg extends React.Component {
  getProcessedData() {
    let processedData = this.props.data.slice()

    if (this.props.sorted) {
      let sortFunc = null
      if (this.props.descending) {
        sortFunc = (a, b) => b[this.props.sorted] - a[this.props.sorted]
      } else {
        sortFunc = (a, b) => a[this.props.sorted] - b[this.props.sorted]
      }

      processedData.sort(sortFunc)
    } else if (this.props.sortedFunc) {
      processedData.sort(this.props.sortedFunc)
    }

    if (this.props.quantity) {
      processedData = processedData.map(d => d[this.props.quantity])
    } else if (this.props.quantityFunc) {
      processedData = processedData.map(quantityFunc)
    }

    return processedData
  }

  getKeyFunc() {
    if (this.props.keyed) {
      return d => d[this.props.keyed]
    } else if (this.props.keyFunc) {
      return this.props.keyFunc
    }
  }

  getColorFunc() {
    if (this.props.color) {
      return d => d[this.props.color]
    } else if (this.props.colorFunc) {
      return this.props.colorFunc
    }

    let hue = 0
    const defaultColorFunc = i => {
      const c = `hsl(${hue},100%,50%)`
      hue = (hue + 257) % 360
      return c
    }

    return defaultColorFunc
  }

  normalize(vector) {
    const total = vector.reduce((a, b) => a + b)
    return vector.map(x => x / total)
  }

  sectorPathStr(frac) {
    const innerRadius = this.props.innerRadius || .75,
          largeArc = frac > .5 ? '1': '0',
          angle = 2 * Math.PI * frac,
          outerEnd = [Math.cos(angle), Math.sin(angle)],
          innerEnd = vec.scale(outerEnd, innerRadius)

    return [
      `M ${innerRadius} 0 L 1 0`,
      `A 1 1 0 ${largeArc} 0 ${outerEnd.join(' ')}`,
      `L ${innerEnd.join(' ')}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerRadius} 0 Z`
    ].join(' ')
  }

  createSectors() {
    let curOffset = 0,
        color = this.getColorFunc(),
        keyFunc = this.getKeyFunc(),
        data = this.getProcessedData()
    
    const sectors = this.normalize(data)
      .map((frac, i) => {
        const offset = curOffset,
              pathStr = this.sectorPathStr(frac),
              transform = `rotate(${360 * offset})` 
        curOffset += frac

        return (
          <path
            key={keyFunc(this.props.data[i])}
            d={pathStr}
            fill={color(this.props.data[i])}
            transform={transform} />
        )
      })

    return sectors
  }

  render() {
    const diameter = this.props.diameter || 150,
          radius = diameter / 2,
          transform = "matrix(%, 0, 0, -%, %, %)"
            .replace(/%/g, radius.toFixed(2))
    return (
      <g transform={transform}>
        {this.createSectors()}
      </g>
    )
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
}
