import React from 'react'

import { observe, takeKeys, transformProps } from '../../lib/func-util'

const cacheKey = Symbol()
export class Chart extends React.Component {
  makeValueGetter(_prop) {
    if (typeof _prop === 'string') {
      let p
      const restIdx = _prop.search(/\w\.\w/) + 2
      if (restIdx !== 1) { // split found
        const deeperGetter = this.makeValueGetter(_prop.substr(restIdx)),
        p = _prop.substr(0, restIdx - 2).replace('..', '.')

        return data => (deeperGetter(data)[p])
      } 

      p = _prop.replace('..', '.')

      return data => data[p]
    } else if (typeof _prop === 'number') {
      return data => data[_prop]
    } else if (Array.isArray(_prop)) {
      const dim = _prop.length,
            getters = _prop.map(p => this.makeValueGetter(p))

      return data => {
        let output = vec.empty(dim)
        output.forEach((_, i) => output[i] = getters[i](data))
        return output
      }
    } else if (typeof _prop === 'function') {
      return data => _prop(data)
    } 
  }

  makeFilter(_filter) {
    if (typeof _filter === 'string'
        || typeof _filter === 'number'
        || Array.isArray(_filter)) {
      return filterVal = this.makeValueGetter(_prop)
    } else if (typeof _filter === 'function') {
      return _filter
    }
  }

  makeComparator(_sort, descending=false) {
    let sign = 1, nextDescending = false
    if (Array.isArray(descending)) {
      if (descending[0] === true) {
        sign = -1
      } else {
        sign = 1
      }

      nextDescending = descending.slice(1)
    } else if (descending === true) {
      sign = -1
    }

    if (_sort === true) {
      return (a, b) => a < b ? -sign : sign
    } else if (typeof _sort === 'string' || typeof _sort === 'number'
               || typeof _sort === 'function') {
      const val = this.makeValueGetter(_sort)
      return (a, b) => val(a) < val(b) ? -sign : sign
    } else if (Array.isArray(_sort)) {
      const val = this.makeValueGetter(_sort[0])
      if (_sort.length === 1) {
        return (a, b) => val(a) < val(b) ? -sign : sign
      }

      const nextComparator = this.makeComparator(_sort.slice(1),
                                                 nextDescending)
      return (a, b) => {
        const valA = val(a), valB = val(b)
        return (valA < valB
                ? -sign
                : valA > valB
                  ? sign
                  : nextComparator(a, b))
      }
    }
  }

  makeKeyGetter(keyProp=this.chartProps.keyProp) {
    if (this.props[keyProp]) {
      return this.makeValueGetter(this.props[keyProp])
    }

    let curKey = 0, keyMap = new WeakMap()
    
    return d => (keyMap.has(d) 
                 ? keyMap.get(d)
                 : keyMap.set(d, curKey++).get(d))
  }

  makeColorGetter(colorProp=this.chartProps.colorProp) {
    if (this.props[colorProp]) {
      return this.makeValueGetter(this.props[colorProp])
    }

    let hue = 0,
        colorMap = new WeakMap(),
        genColor = () => {
          const c = `hsl(${hue},100%,50%)`
          hue = (hue + 257) % 360
          return c
        }

    return d => (colorMap.has(d)
                 ? colorMap.get(d)
                 : colorMap.set(d, genColor()).get(d))
  }

  sortedByProp(data,
               sortProp=this.chartProps.sortProp,
               descProp=this.chartProps.descProp) {
    if (this.props[sortProp]) {
      return data.slice()
        .sort(this.makeComparator(this.props[sortProp], this.props[descProp]))
    }

    return data
  }

  filteredByProp(data, filterProp=this.chartProps[filterProp]) {
    if (this.props[filterProp]) {
      return data.filter(this.makeFilter(this.props[filterProp]))
    }

    return data
  }

  valuedByProp(data, valuatorProp=this.chartProps.valuatorProp) {
    if (this.props[valuatorProp]) {
      const valueGetter = this.makeValueGetter(this.props[valuatorProp])
      return data.map(valueGetter)
    }
    
    return data
  }

  getData(dataProp=this.chartProps.dataProp) {
    return this.sortedByProp(this.filteredByProp(this.props[dataProp]))
  }

  getValues(data=this.getData()) {
    return this.valuedByProp(data)
  }

  getDimension(values) {
    return values[0].length
  }

  getRange(values=this.getValues()) {
    let range = vec.zeros(2)
    values.forEach(v => {
      if (v < range[0]) {
        range[0] = v
      } else if (v > range[1]) {
        range[1] = v
      }
    })
  }

  getRanges(values=this.getValues(), dim=this.getDimension(values)) {
    let ranges = mat.zeros(dim, 2)

    ranges.forEach((range, i) => {
      if (typeof values[0][i] === 'string') {
        ranges[i] = new Set(values.map(v => v[i]))
        return
      }

      values.forEach(v => {
        if (v[i] < range[0]) {
          range[0] = v[i]
        } else if (v[i] > range[1]) {
          range[1] = v[i]
        }
      })
    })

    return ranges
  }

  getPassedProps() {
    return takeKeys(
      this.props,
      prop => !(this.chartPropsSet.has(prop)
                || this.customPropsSet.has(prop)
                || this.reactPropsSet.has(prop)))
  }

  passData(child) {
    return React.cloneElement(child, { data: this.getValues() })
  }

  render() {
    const children = React.Children.toArray(this.props.children),
          passedProps = this.getPassedProps()

    return (
      <svg {...passedProps}>
        {children.map(child => this.passData(child))}
      </svg>
    )
  }

  get chartPropsSet() {
    if (this.constructor[cacheKey].chartPropsSet) {
      return this.constructor[cacheKey].chartPropsSet
    }

    return (this.constructor[cacheKey].chartPropsSet = (new Set(
      Object.keys(this.chartProps).map(k => this.chartProps[k])
    )))
  }
}

Chart[cacheKey] = {}
Object.defineProperties(
  Chart.prototype,
  {
    chartProps: {
      value: Object.freeze({
        dataProp: 'data',
        filterProp: 'filtered',
        sortProp: 'sorted',
        descProp: 'descending',
        valuatorProp: 'valued',
        colorProp: 'colored',
        keyProp: 'keyed'
      })
    },
    customPropsSet: {
      value: Object.freeze(new Set())
    },
    reactPropsSet: {
      value: Object.freeze(new Set(['key', 'ref']))
    }
  }
)

export class ChartElement extends React.Component {
  getDatum() {
    return this.props[this.chartProps.datumProp]
  }

  getValue(datum=this.getDatum(), valueProp=this.chartProps.valueProp) {
    if (this.props.hasOwnProperty(valueProp)) {
      return this.props[valueProp]
    }

    return datum
  }

  getRange() {
    return this.props[this.chartProps.rangeProp]
  }

  getPassedProps() {
    return takeKeys(
      this.props,
      prop => !((this.chartPropsSet).has(prop)
                || this.customPropsSet.has(prop)
                || this.reactPropsSet.has(prop)))
  }

  get chartPropsSet() {
    if (this.constructor[cacheKey].chartPropsSet) {
      return this.constructor[cacheKey].chartPropsSet
    }

    return (this.constructor[cacheKey].chartPropsSet = (new Set(
      Object.keys(this.chartProps).map(k => this.chartProps[k])
    )))
  }
}

ChartElement[cacheKey] = {}
Object.defineProperties(
  ChartElement.prototype,
  {
    chartProps: {
      value: Object.freeze({
        datumProp: 'datum',
        valueProp: 'value',
        colorProp: 'color',
        rangeProp: 'range'
      })
    },
    customPropsSet: {
      value: Object.freeze(new Set())
    },
    reactPropsSet: {
      value: Object.freeze(new Set(['key', 'ref']))
    }
  }
)
