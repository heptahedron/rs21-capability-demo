const bdts = require('./block-data-tables'),
      turf = require('turf')

class CensusDataParser {
  constructor() {
    this.censusBlockData = []
  }

  parseCensusData(censusDataStr) {
    // these could all really be better named couldn't they
    const oldCensusBlockData = JSON.parse(censusDataStr)

    oldCensusBlockData.features.forEach(feature => {
      const newCensusBlockDatum = bdts
        .map(bdt => ({
          [bdt.dataDesc]: bdt.simplifyProperties(feature.properties)
        }))
        .reduce((data, acc) => Object.assign(acc, data), {})

      this.censusBlockData.push(turf.polygon(
        feature.geometry.coordinates,
        newCensusBlockDatum))
    })
  }

  toGeoJson() {
    return turf.featureCollection(this.censusBlockData)
    // return turf.featureCollection(this.censusBlockData)
  }
}

module.exports = function(censusJsonStr) { 
  this.cacheable()
  const cdp = new CensusDataParser()
  cdp.parseCensusData(censusJsonStr)
  return `module.exports=${JSON.stringify(cdp.toGeoJson())}`
}
