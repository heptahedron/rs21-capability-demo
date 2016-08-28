const bdts = require('./block-data-tables'),
      turf = require('turf')

class CensusDataParser {
  constructor() {
    this.censusBlockData = []
    this.processedData = []
  }

  parseCensusData(censusDataStr) {
    // these could all really be better named couldn't they
    const oldCensusBlockData = JSON.parse(censusDataStr)

    oldCensusBlockData.features.forEach(feature => {
      let newCensusBlockDatum = bdts
        .map(bdt => ({
          [bdt.dataDesc]: bdt.simplifyProperties(feature.properties)
        }))
        .reduce((data, acc) => Object.assign(acc, data), {})
      newCensusBlockDatum.landArea = feature.properties.ALAND

      this.censusBlockData.push(turf.polygon(
        feature.geometry.coordinates,
        newCensusBlockDatum))
    })

    this.processCensusData()
  }

  processCensusData() {
    this.processedData = this.censusBlockData.map(feature => {
      const { properties: {
                medianGenderAges: {
                  medianAge
                }
              } } = feature
      return turf.polygon(feature.geometry.coordinates, {
        medianAge
      })
    })
  }

  toGeoJson() {
    return turf.featureCollection(this.processedData)
  }
}

module.exports = function(censusJsonStr) { 
  this.cacheable()
  const cdp = new CensusDataParser()
  cdp.parseCensusData(censusJsonStr)
  return `module.exports=${JSON.stringify(cdp.toGeoJson())}`
}
