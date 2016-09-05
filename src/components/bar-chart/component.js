import React from 'react'

import Chart from '../chart/component'

export class BarChart extends Chart {
  getDefaultBarElement() {
    return <Bar />
  }

  getBarElement() {
    const barElement = React.Children.toArray(this.props.children)
      .filter(child => child.type === Bar)

    if (barElement.length > 0) {
      throw "Only one Bar element per BarChart!"
    }

    return barElement[0] || this.getDefaultBarElement()
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

BarChart.prototype.propMask = Object.assign(
  {},
  Chart.prototype.propMask,
  {
    width: true,
    height: true
  }
)

export class Bar extends Chart {
  render() {
    const { x, y, width, height } = this.props

    return (
      <rect 
        x={x} y={y}
        width={width} height={height}
        {...this.getPassedProps()} />
    )
  }
}

Bar.prototype.propMask = Object.assign(
  {},
  Chart.prototype.propMask,
  {
    
  }
)
