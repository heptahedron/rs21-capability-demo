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
      newCensusBlockDatum.totalArea = feature.properties.ALAND
                                      + feature.properties.AWATER

      this.censusBlockData.push(turf.polygon(
        feature.geometry.coordinates,
        newCensusBlockDatum))
    })

    this.processCensusData()
  }

  processCensusData() {
    this.processedData = this.censusBlockData.map(feature => {
      const { properties: {
                totalArea,
                genderAges: {
                  totalPop
                },
                medianGenderAges: {
                  medianAge
                },
                households: {
                  totalHouseholds,
                  familyHouseholds,
                  nonFamilySoloHouseholds
                },
                earnings: {
                  earnings,
                  noEarnings
                }
              } } = feature,
            totalEarningsMeasured = earnings + noEarnings

      return turf.polygon(feature.geometry.coordinates, {
        populationDensity: Math.log10(totalPop/totalArea),
        totalHouseholds,
        fracFamilyHouseholds: totalHouseholds
                              ? familyHouseholds/totalHouseholds
                              : 0,
        fracLivingSolo: totalHouseholds
                        ? nonFamilySoloHouseholds/totalHouseholds
                        : 0,
        fracEarning: totalEarningsMeasured
                     ? earnings/totalEarningsMeasured
                     : 0,
        fracNotEarning: totalEarningsMeasured
                        ? noEarnings/totalEarningsMeasured
                        : 0,
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
