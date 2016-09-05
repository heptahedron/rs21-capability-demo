import React from 'react'

import { Chart, ChartElement } from '../chart/component'

import { observe, takeKeys } from '../../lib/func-util'
import { vec } from '../../lib/matrix-util'

export class PieChart extends Chart {
  makeDefaultSector() {
    const radius = this.props.size / 2
    return <Sector
             radius={radius}
             origin={[radius, radius]} />
  }

  getSector() {
    return this.props.sector || this.makeDefaultSector()
  }

  makeChartElements() {
    let offset = 0
    const sector = this.getSector(),
          data = this.getData(),
          values = this.getValues(data),
          getKey = this.makeKeyGetter(),
          getColor = this.makeColorGetter(),
          range = values.reduce((a, b) => a + b, 0)

    return data.map((datum, i) => {
      const value = values[i],
            clonedSector = React.cloneElement(
              sector,
              { datum, value, range,
                offset, color: getColor(datum),
                key: getKey(datum) }) 

      offset += values[i]

      return clonedSector
    })
  }

  render() {
    return (
      <svg {...this.getPassedProps()}>
        {this.makeChartElements()}
      </svg>
    )
  }
}

Object.defineProperty(
  PieChart.prototype,
  'customPropsSet',
  {
    value: Object.freeze(new Set(['sector']))
  }
)

const tau = Math.PI * 2

export class Sector extends ChartElement {
  getOrigin() {
    return this.props.origin || [this.props.radius, this.props.radius]
  }

  makePathStr() {
    const { innerRadius, radius: outerRadius } = this.props,
          origin      = this.getOrigin(),
          total       = this.getRange(),
          startAngle  = tau * (this.props.offset / total),
          endAngle    = tau * (this.getValue() / total) + startAngle,
          normStart   = [Math.cos(startAngle),
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

    return pathStr
  }

  render() {
    return (<path d={this.makePathStr()}
              fill={this.props.color}
              {...this.getPassedProps()} />)
  }
}

Object.defineProperty(
  Sector.prototype,
  'customPropsSet',
  {
    value: Object.freeze(new Set([
      'offset',
      'radius',
      'innerRadius'
    ]))
  }
)

Sector.defaultProps = {
  innerRadius: 0
}
