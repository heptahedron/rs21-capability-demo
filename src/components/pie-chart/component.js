import React from 'react'

import DataVis from '../data-vis/component'

import { vec } from '../../lib/matrix-util'

export default class PieChart extends DataVis {
  getSectorElement() {
    const sector = React.Children(this.props.children).toArray()
      .filter(child => child.type === Sector)
    
    if (sector.length > 1) throw "Only one Sector definition per PieChart!"

    return sector[0] || this.constructor.defaultSector
  }

  makeSectors() {
    const SectorElement = this.getSectorElement(),
          data = this.getData(),

  }

  render() {
    const size      = this.props.size,
          radius    = size / 2,
          className = this.props.className || '',
          viewBox   = `${-radius} ${-radius} ${size} ${size}`

    return (
      <svg width={size} height={size} viewBox={viewBox} className={className}>
        {this.makeSectors()}
      </svg>
    )
  }
}

PieChart.defaultSector = <Sector innerRadius={0} />

export class Sector extends DataVis {
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

  pathStr(innerRadius, angle) {
    const largeArc = frac > .5 ? '1': '0',
          outerEnd = [Math.cos(angle), Math.sin(angle)],
          innerEnd = vec.scale(outerEnd, innerRadius),
          [oeStr, ieStr] = [outerEnd, innerEnd].map(v => v.join(' ')),
          pathStr = [
            `M ${innerRadius} 0 L 1 0`,
            `A 1 1 0 ${largeArc} 1 ${oeStr}`,
            `L ${ieStr}`,
            `A ${innerRadius} ${innerRadius}`,
              `0 ${largeArc} 0 ${innerRadius} 0 Z`
          ].join(' ')

    return pathStr
  }

  render() {
    let curOffset = 0
    const radius = this.props.radius,
          innerRadius = this.props.innerRadius,
          data = this.getData()

    return (
      <path {...this.props} d={pathStr} />
    )
  }
}

Sector.defaultProps = {
  innerRadius: 0
}
