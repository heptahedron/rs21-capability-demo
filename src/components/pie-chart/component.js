import { vec } from '../../lib/matrix-util'

import React from 'react'

export default class PieChart extends React.Component {
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

  getSectorElement() {
    const sector = React.Children.toArray()
      .filter(child => child.type === Sector)
    
    if (sector.length > 1) throw "Only one Sector definition per PieChart!"

    return sector || this.constructor.defaultSector
  }

  makeSectors() {
    const SectorElement = this.getSectorElement(),
          
  }

  render() {
    const diameter = this.props.diameter,
          radius = diameter / 2,
          className = this.props.className || ''

    return (
      <svg width={diameter} height={diameter} viewBox="-1 -1 2 2"
        className={className}>
        {this.makeSectors()}
      </svg>
    )
  }
}

PieChart.defaultSector = <Sector width={0.75} radius={1} />

export class Sector extends React.Component {
  render() {
    const width = this.props.width / this.props.radius,
          largeArc = frac > .5 ? '1': '0',
          angle = 2 * Math.PI * frac,
          outerEnd = [Math.cos(angle), Math.sin(angle)],
          innerEnd = vec.scale(outerEnd, width),
          [oeStr, ieStr] = [outerEnd, innerEnd].map(v => v.join(' ')),
          pathStr = [
            `M ${width} 0 L 1 0`,
            `A 1 1 0 ${largeArc} 1 ${oeStr}`,
            `L ${ieStr}`,
            `A ${width} ${width}`,
              `0 ${largeArc} 0 ${width} 0 Z`
          ].join(' ')

    return (
      <path {...this.props} d={pathStr} />
    )
  }
}
