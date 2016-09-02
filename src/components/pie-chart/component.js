import React from 'react'

import DataVis from '../data-vis/component'

import { observe, takeKeys } from '../../lib/func-util'
import { vec } from '../../lib/matrix-util'

export class PieChart extends DataVis {
  getSectorElement() {
    const sector = React.Children.toArray(this.props.children)
      .filter(child => child.type === Sector)
    
    if (sector.length > 1) throw "Only one Sector definition per PieChart!"

    return sector[0] || this.constructor.defaultSector
  }

  makeSectors() {
    const sectorElement = this.getSectorElement(),
          data = this.sortedByProp(this.filteredByProp(this.props.data))

    return React.cloneElement(sectorElement, { data })
  }

  render() {
    const size      = this.props.size,
          radius    = size / 2,
          className = this.props.className || ''

    return (
      <svg width={size} height={size} viewBox="-1 -1 2 2"
        className={className}>
        {this.makeSectors()}
      </svg>
    )
  }
}

export class Sector extends DataVis {
  getColorFunc() {
    if (this.props.color) {
      return this.makeValueGetter(this.props.color)
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
    const largeArc = angle > Math.PI ? '1': '0',
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
          innerRadius = this.props.innerRadius / radius,
          data = this.sortedByProp(this.filteredByProp(this.props.data)),
          values = data.map(this.makeValueGetter(this.props.value)),
          key = this.props.keyed
                ? this.makeValueGetter(this.props.keyed)
                : (m => d => m.get(d))(new WeakMap(data.map((d, i) => [d, i]))),
          total = values.reduce((a, b) => a + b),
          fracs = values.map(v => v / total),
          color = this.getColorFunc(),
          twoPi = 2 * Math.PI,
          paths = data.map((d, i) => {
            const angleRads = twoPi * fracs[i],
                  angleDegs = 360 * fracs[i],
                  path = <path 
                           d={this.pathStr(innerRadius, angleRads)}
                           fill={color(d)}
                           key={key(d)}
                           transform={`rotate(${curOffset})`} />

            curOffset += angleDegs
            return path
          })

    return (<g>{paths}</g>)
  }
}

PieChart.defaultSector = <Sector innerRadius={0} />

Sector.defaultProps = {
  innerRadius: 0
}
