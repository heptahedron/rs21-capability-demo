import React from 'react'

import Chart from '../chart/component'

import { vec, mat } from '../../lib/matrix-util'

export class BarChart extends Chart {
  makeDefaultBar() {
    return <Bar />
  }

  makeBars() {
    let curOffset = 0
    const data = this.getData(),
          values = this.getValuesFromData(data),

          color = this.getColorGetter(),
          maxWidth = this.props.width,
          maxHeight = this.props.height,
          barElement = this.getBarElement()

    return 
  }

  render() {
    return (
      <g {...this.getPassedProps()}>
        {this.makeBars()}
      </g>
    )
  }
}

Object.defineProperty(
  BarChart.prototype,
  'customPropsSet',
  {
    value: Object.freeze(new Set(['']))
  }
)

export class MultiAxisChart extends Chart {
  getDefaultOrigin(ranges) {
    return Math.max(ranges[1][1], 0)
  }
  
  getOrigin() {
    return this.props.origin || [0, this.props.height]
  }

  makeCoordTransform() {
    return v => {
      if 
    }
  }

  makeAxes() {

  }

  render() {
    return (
      <g>{this.makeAxes()}</g>
    )
  }
}

Object.defineProperties(
  Axes.prototype,
  {
    customPropsSet: {
      value: Object.freeze(new Set([
        'origin', 'flipped' 
      ]))
    },
    chartProps: {
      value: Object.freeze(Object.assign({
        xProp: 'xValue',
        yProp: 'yValue'
      }, Chart.prototype.chartProps))
    }
  }
)
