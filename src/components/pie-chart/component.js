import { vec } from '../../lib/matrix-util'

import React from 'react'

export default class PieChart extends React.Component {
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
    
    return x => x
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
          innerEnd = vec.scale(outerEnd, innerRadius),
          [oeStr, ieStr] = [outerEnd, innerEnd].map(v => v.join(' '))

    return [
      `M ${innerRadius} 0 L 1 0`,
      `A 1 1 0 ${largeArc} 1 ${oeStr}`,
      `L ${ieStr}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerRadius} 0 Z`
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
          radius = diameter / 2
    return (
      <svg width={diameter} height={diameter} viewBox="-1 -1 2 2">
        {this.createSectors()}
      </svg>
    )
  }
}
