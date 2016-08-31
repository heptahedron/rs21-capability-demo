export const fbLayers = {
  checkinMagnitude: {
    type: 'circle',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': {
        property: 'nCheckins',
        stops: [
          [0, 5],
          [500, 10]
        ]
      },
      'circle-opacity': .4
    }
  }
}

export const twitterLayers = {}
export const censusLayers = {}
