import React from 'react'

export default class PieChartSvg extends React.Component {
  getProcessedData() {
    let processedData = this.props.data.slice()

    if (this.props.sorted) {
      processedData.sort((a, b) => a[this.props.sorted] - b[this.props.sorted])
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
      hue += 360 - 43
      return c
    }

    return defaultColorFunc
  }

  normalize(vector) {
    const total = vector.reduce((a, b) => a + b)
    return vector.map(x => x / total)
  }

  fractionToRads(f) {
    return 2 * Math.PI * f
  }

  radsToPoint(r) {
    return [Math.cos(r), Math.sin(r)]
  }

  scaleFunc(radius) {
    return point => {
      point[0] *= radius
      point[1] *= radius
    }
  }

  toPathStrCoords(point) {
    point[0] = point[0].toFixed(2)
    point[1] = point[1].toFixed(2)
  }

  sectorPathStr(frac, offset, radius) {
    let startAngle = this.fractionToRads(offset),
        endAngle = this.fractionToRads(offset + frac),
        startPoint = this.radsToPoint(startAngle),
        endPoint = this.radsToPoint(endAngle),
        largeArcFlag = Math.abs(frac) > .5 ? '1' : '0',
        sweepFlag = frac > 0 ? '0' : '1'

    startPoint[0] = 1 + startPoint[0]
    startPoint[1] = 1 - startPoint[1] // canvas coords increase down
    endPoint[0] = 1 + endPoint[0]
    endPoint[1] = 1 - endPoint[1]
    ;[startPoint, endPoint].forEach(this.scaleFunc(radius))
    ;[startPoint, endPoint].forEach(this.toPathStrCoords)
    
    return [
      `M ${radius} ${radius}`,
      `L ${startPoint[0]} ${startPoint[1]}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag}`,
      `${endPoint[0]} ${endPoint[1]} Z`
    ].join(' ')
  }

  createSectors() {
    let curOffset = 0,
        radius = this.props.sideLength / 2,
        color = this.getColorFunc(),
        keyFunc = this.getKeyFunc()
    
    const sectors = this.getProcessedData()
      .map((frac, i) => {
        const offset = curOffset,
              pathStr = this.sectorPathStr(frac, offset, radius)
        curOffset += frac

        return (
          <path
            key={keyFunc(this.props.data[i])}
            d={pathStr}
            fill={color(this.props.data[i])} />
        )
      })

    return sectors
  }

  render() {
    return (
      <g>
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
