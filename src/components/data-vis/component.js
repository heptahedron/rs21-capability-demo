import React from 'react'

import { takeKeys } from '../../lib/func-util'

export default class DataVis extends React.Component {
  makeValueGetter(_prop) {
    if (typeof _prop === 'string'
        || typeof _prop === 'number') {
      return data => data[_prop]
    } else if (Array.isArray(_prop) && _prop.length >= 1) {
      if (_prop.length === 1){
        return this.makeValueGetter(_prop[0])
      } 

      const deeperGetter = this.makeValueGetter(_prop.slice(1))
      return data => deeperGetter(data[_prop[0]])
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

  sortedByProp(data, sortProp='sorted', descProp='descending') {
    if (this.props[sortProp]) {
      return data.slice()
        .sort(this.makeComparator(this.props[sortProp], this.props[descProp]))
    }

    return data
  }

  filteredByProp(data, filterProp='filter') {
    if (this.props[filterProp]) {
      return data.filter(this.makeFilter(this.props[filterProp]))
    }

    return data
  }

  getColorGetter(colorProp='color') {
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

  getData(dataProp='data') {
    return this.sortedByProp(this.filteredByProp(this.props[dataProp]))
  }

  getValuesFromData(data, valueProp='value') {
    if (this.props[valueProp]) {
      return data.map(this.makeValueGetter(this.props[valueProp]))
    }

    return data
  }

  makeKeyGetter(keyProp='keyed') {
    if (this.props.keyed) {
      return this.makeValueGetter(this.props.keyed)
    }

    let curKey = 0, keyMap = new WeakMap()
    
    return d => (keyMap.has(d) 
                 ? keyMap.get(d)
                 : keyMap.set(d, curKey++).get(d))
  }

  getPropBlacklist() {
    return DataVis.defaultPropFilter
  }

  getAllowedProps(blacklist=this.getPropBlacklist()) {
    return takeKeys(this.props, prop => !blacklist[prop])
  }
}

DataVis.defaultPropBlacklist = {
  data: true,
  value: true,
  keyed: true,
  sorted: true,
  color: true
}
