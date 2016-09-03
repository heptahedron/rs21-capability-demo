import React from 'react'

import DataVis from '../data-vis/component'

import { observe, takeKeys } from '../../lib/func-util'
import { vec } from '../../lib/matrix-util'

export class PieChart extends DataVis {
  getDefaultSector() {
    return <Sector radius={this.props.size / 2} />
  }

  getSectorElement() {
    const sector = React.Children.toArray(this.props.children)
      .filter(child => child.type === Sector)
    
    if (sector.length > 1) throw "Only one Sector definition per PieChart!"

    return sector[0] || this.getDefaultSector()
  }

  getPropBlacklist() {
    return this.constructor.defaultPropBlacklist
  }

  renderSectors() {
    const sectorElement = this.getSectorElement(),
          data = this.sortedByProp(this.filteredByProp(this.props.data))

    return React.cloneElement(sectorElement, { data })
  }

  render() {
    const size = this.props.size

    return (
      <svg width={size} height={size} viewBox="-1 -1 2 2"
        {...this.getAllowedProps()}>
        {this.renderSectors()}
      </svg>
    )
  }
}

PieChart.defaultPropBlacklist = Object.assign(
  {}, DataVis.defaultPropBlacklist, { size: true })

PieChart.defaultProps = {
  size: 150
}

export class Sector extends DataVis {
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

  getPropBlacklist() {
    return this.constructor.defaultPropBlacklist
  }

  render() {
    let curOffset = 0
    const radius = this.props.radius,
          innerRadius = this.props.innerRadius / radius,
          data = this.getData(),
          values = this.getValuesFromData(data),
          key = this.makeKeyGetter(),
          total = values.reduce((a, b) => a + b),
          fracs = values.map(v => v / total),
          color = this.getColorGetter(),
          twoPi = 2 * Math.PI,
          paths = data.map((d, i) => {
            const angleRads = twoPi * fracs[i],
                  angleDegs = 360 * fracs[i],
                  path = <path 
                           d={this.pathStr(innerRadius, angleRads)}
                           fill={color(d)}
                           key={key(d)}
                           transform={`rotate(${curOffset})`}
                           {...this.getAllowedProps()} />

            curOffset += angleDegs
            return path
          })

    return (<g>{paths}</g>)
  }
}

Sector.defaultPropBlacklist = Object.assign(
  {},
  DataVis.defaultPropBlacklist,
  {
    transform: true,
    d: true,
    fill: true,
    innerRadius: true
  }
)

Sector.defaultProps = {
  innerRadius: 0
}
