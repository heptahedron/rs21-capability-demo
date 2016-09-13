import React from 'react'

import { Chart, ChartElement } from '../chart/component'

import { observe, takeKeys } from '../../lib/func-util'
import { vec } from '../../lib/matrix-util'

export class PieChart extends Chart {
  makeDefaultSector() {
    const radius = Math.min(this.props.width, this.props.height) / 2
    return <Sectors
             radii={radius}
             origin={[this.props.width / 2, this.props.height / 2]} />
  }

  render() {
    if (React.Children.count(this.props.children) === 0) {
      return this.makeDefaultSector()
    } else {
      return super.render()
    }
  }
}

Object.defineProperty(
  PieChart.prototype,
  'customPropsSet',
  {
    value: Object.freeze(new Set([]))
  }
)

const tau = Math.PI * 2

export class Sectors extends Chart {
  constructor(props) {
    super(props)
    this.sectorDataMap = new WeakMap()
  }

  getOrigin() {
    return this.props.origin || [this.props.radii, this.props.radii]
  }

  makePath(innerRadius, outerRadius,
           startAngle, endAngle,
           origin, passedProps, datum) {
    const normStart   = [Math.cos(startAngle),
                         Math.sin(startAngle)],
          innerStart  = vec.scale(normStart, innerRadius),
          outerStart  = vec.scale(normStart, outerRadius),
          normEnd     = [Math.cos(endAngle),
                         Math.sin(endAngle)],
          innerEnd    = vec.scale(normEnd, innerRadius),
          outerEnd    = vec.scale(normEnd, outerRadius),
          points      = [innerStart, innerEnd, outerEnd, outerStart]
            .map(v => vec.add(v, origin))
            .map(v => v.join(' ')),
          largeArc = endAngle - startAngle > Math.PI ? '1': '0',
          pathStr = `\
M ${points[0]} \
A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${points[1]} \
L ${points[2]} \
A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${points[3]} Z`

    return (
      <path d={pathStr} {...passedProps}
        ref={sector => this.sectorDataMap.set(sector, datum)} />
    )
  }

  makeSectors() {
    let offset = 0
    const { innerRadii: innerRadius, radii: outerRadius } = this.props,
          origin      = this.getOrigin(),
          data        = this.getData(),
          values      = this.getValues(data),
          total       = values.reduce((a, b) => a + b, 0),
          getKey      = this.makeKeyGetter(),
          getColor    = this.makeColorGetter(),
          passedProps = this.getPassedProps()

    return data.map((datum, i) => {
      const startAngle  = tau * (offset / total),
            endAngle    = tau * (values[i] / total) + startAngle,
            pathProps   = Object.assign(
                            { key: getKey(datum), fill: getColor(datum) },
                            passedProps),
            sector      = this.makePath(
                            innerRadius, outerRadius,
                            startAngle, endAngle,
                            origin, pathProps, datum)

      offset += values[i]

      return sector
    })
  }

  render() {
    return (
      <g>
        {this.makeSectors()}
      </g>
    )
  }
}

Object.defineProperty(
  Sectors.prototype,
  'customPropsSet',
  {
    value: Object.freeze(new Set([
      'origin',
      'radii',
      'innerRadii'
    ]))
  }
)

Sectors.defaultProps = {
  innerRadii: 0
}
