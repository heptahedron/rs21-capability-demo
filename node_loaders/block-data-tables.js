function zeroFill(num, size) {
  if (Math.log10(num) + 1 < size) {
    return '0' + zeroFill(num, size - 1)
  } 

  return num.toString()
}

function longFieldName(blockId, fieldId) {
  return `ACS_13_5YR_B${blockId}_with_ann_HD01_VD${zeroFill(fieldId, 2)}`
}

function* longFieldNames(blockId, rangeStart, rangeEnd) {
  for (let i = rangeStart; i <= rangeEnd; ++i) {
    yield longFieldName(blockId, i)
  }
}

function zipFieldsWithNames(
    blockId,
    rangeStart,
    oldProps,
    newPropNames) {
  let result = {},
      i = 0,
      rangeEnd = rangeStart + newPropNames.length - 1

  for (const lfn of longFieldNames(blockId, rangeStart, rangeEnd)) {
    result[newPropNames[i]] = oldProps[lfn]
    ++i
  }

  return result
}

module.exports = [
  {
    dataDesc: 'genderAges',
    id: '01001',
    simplifyProperties(props) {
      let newProps = {}
      newProps.totalPop = parseInt(props[longFieldName(this.id, 1)])
      newProps.totalMalePop = parseInt(props[longFieldName(this.id, 2)])
      newProps.totalFemalePop = parseInt(props[longFieldName(this.id, 26)])
      newProps.maleAgeRanges = []
      newProps.femaleAgeRanges = []

      for (const maleAgeRangeField of longFieldNames(this.id, 3, 25)) {
        newProps.maleAgeRanges.push(parseInt(props[maleAgeRangeField]))
      }

      for (const femaleAgeRangeField of longFieldNames(this.id, 27, 49)) {
        newProps.femaleAgeRanges.push(parseInt(props[femaleAgeRangeField]))
      }

      return newProps
    }
  },
  {
    dataDesc: 'medianGenderAges',
    id: '01002',
    simplifyProperties(props) {
      let newProps = {
        medianAge: parseFloat(props[longFieldName(this.id, 2)]),
        medianMaleAge: parseFloat(props[longFieldName(this.id, 3)]),
        medianFemaleAge: parseFloat(props[longFieldName(this.id, 4)])
      }

      return newProps
    }
  },
  {
    dataDesc: 'workTransportation',
    id: '08301',
    simplifyProperties(props) {
      // TODO include carpool data
      let newProps = {
        totalWorking: parseInt(props[longFieldName(this.id, 1)]),
        multiSeatVehicle: parseInt(props[longFieldName(this.id, 2)])
      }

      const newFieldNames = [
              'publicTransportation',
              'bus',
              'streetcar',
              'subway',
              'railroad',
              'ferry',
              'taxi',
              'motorcycle',
              'bicycle',
              'walked',
              'other',
              'workAtHome'
            ],
            fieldsStart = 10
      
      let transportTypeValStrs = Object.assign({}, zipFieldsWithNames(
        this.id,
        fieldsStart,
        props,
        newFieldNames))

      newFieldNames.forEach(
        field => 
          newProps[field] = parseInt(transportTypeValStrs[field]))

      return newProps
    }
  },
  {
    dataDesc: 'households',
    id: '11001',
    simplifyProperties(props) {
      const householdTypes = [
              'total',
              'family',
              'marriedCouple',
              'otherFamily',
              'noWife', // not entirely semantically accurate, see metadata
              'noHusband', // "
              'nonFamily',
              'nonFamilySolo',
              'nonFamilyNonSolo'
            ],
            newFieldNames = householdTypes.map(hType => hType + 'Households'),
            newProps = zipFieldsWithNames(
              this.id,
              1,
              props,
              newFieldNames
            )

      newFieldNames.forEach(
        field => 
          newProps[field] = parseInt(newProps[field]))

      return newProps
    }
  },
  {
    dataDesc: 'earnings',
    id: '19051',
    simplifyProperties(props) {
      const newFieldNames = [
              'earnings',
              'noEarnings'
            ],
            newProps = zipFieldsWithNames(this.id, 1, props, newFieldNames)

      newFieldNames.forEach(
        field => newProps[field] = parseInt(newProps[field])
      )

      return newProps
    }
  }
]
