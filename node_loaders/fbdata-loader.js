const assert = require('assert'),
      turf = require('turf')

class FbDataParser {
  constructor() {
    this.places = new Map()
    this.placeTypeNums = {}
    this.placeTypes = []
    this._nPlaceTypes = 0
    this.features = []
    this.totalCheckins = 0
  }

  parse(str) {
    str.split('\n').forEach(row => {
      if ((row = row.trim()).length > 0) {
        const placeData = this.parseRow(row)

        // ignore duplicate places
        if (!this.places.has(placeData.name)) {
          this.updateStats(placeData)
          placeData.typeNum = this.placeTypeNums[placeData.typeStr]
          delete placeData.typeStr
          this.places.set(placeData.name, placeData)
        }
      }
    })
  }

  parseRow(str) {
    // this will put a space following any commas within the name
    // regardless of whether or not one was there to begin with, but this
    // is practically inavoidable due to the non-escaping of comma-containing
    // fields
    const fields = str.split(',')
                     .map(f => f.trim())
                     .filter(f => f.length > 0),
          name      = fields.slice(0, -4).join(', '),
          typeStr   = fields[fields.length - 4],
          nCheckins = parseInt(fields[fields.length - 3]),
          lat       = parseFloat(fields[fields.length - 2]),
          lon       = parseFloat(fields[fields.length - 1])

    // console.log({ name, typeStr, nCheckins, lat, lon })
    return { name, typeStr, nCheckins, lat, lon }
  }

  updateStats({ typeStr, nCheckins }) {
    if (typeof this.placeTypeNums[typeStr] === 'undefined') {
      // assign unique integer to every distinct typeStr to save some data
      this.placeTypeNums[typeStr] = this.placeTypes.length
      this.placeTypes.push({
        typeStr,
        nPlaces: 0,
        nCheckins: 0
      })
    }

    const placeTypeData = this.placeTypes[this.placeTypeNums[typeStr]]
    assert(typeof placeTypeData === 'object')
    ++placeTypeData.nPlaces
    placeTypeData.nCheckins += nCheckins
    this.totalCheckins += nCheckins
  }

  // give more frequent places smaller numbers
  // totally unnecessary in retrospect
  optimizeTypeNums() {
    const newNumMapping = this.placeTypes
      .map(({ nPlaces }, oldNum) => [nPlaces, oldNum])
      .sort(([nPlacesA], [nPlacesB]) => nPlacesB - nPlacesA)
      .map(([, oldNum], newNum) => [oldNum, newNum])
      .sort(([oldNumA], [oldNumB]) => oldNumA - oldNumB)
      .map(([, newNum]) => newNum)

    // update typeNum for each individual place
    for (let place of this.places.values()) {
      place.typeNum = newNumMapping[place.typeNum]
    }
    
    // update typeNum->placeType mapping
    this.placeTypes = newNumMapping
      .map((newNum, oldNum) => [newNum, oldNum])
      .sort(([a], [b]) => a - b)
      .map(([, oldNum]) => this.placeTypes[oldNum])

    // update typeStr->typeNum mapping
    Object.keys(this.placeTypeNums)
      .forEach(typeStr =>
        this.placeTypeNums[typeStr] = 
          newNumMapping[this.placeTypeNums[typeStr]]
      )
  }

  toGeoJson() {
    let placePoints = []
    for (const { name, typeNum, nCheckins, lat, lon }
           of this.places.values()) {
      placePoints.push(turf.point([lon, lat], {
        name, typeNum, nCheckins
      }))
    }

    let geoJson = turf.featureCollection(placePoints)
    geoJson.properties = { placeTypes: this.placeTypes,
                           totalCheckins: this.totalCheckins }

    return geoJson
  }
}

module.exports = function(fbPlaceCsv) {
  this.cacheable() // this is definitely a deterministic process
  let fbdp = new FbDataParser()
  fbdp.parse(fbPlaceCsv)
  fbdp.optimizeTypeNums()
  const geoJson = fbdp.toGeoJson()
  console.log(geoJson.features[10].properties)
  console.log(geoJson.properties.placeTypes.School)
  process.exit()
  return `module.exports = ${JSON.stringify(geoJson)}`
}
