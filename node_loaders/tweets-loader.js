const turf = require('turf')

function nthLastIndicesOf(needle, haystack, n, searchStart=+Infinity) {
  const found = haystack.lastIndexOf(needle, searchStart)
  if (found === -1) {
    return []
  } else if (n <= 1) {
    return [found]
  } else {
    return nthLastIndicesOf(needle, haystack, n - 1, found - 1).concat([found])
  }
}

class TweetParser {
  constructor() {
    this.tweets = []
  }

  parseTweets(tweets) {
    let n = 100
    this.tweets = tweets.split('\n')
      .map(t => t.trim())
      .map(t => this.parseTweet(t))
      .filter(t => t !== null)
  }

  parseTweet(tweet) {
    if (tweet.indexOf(';') === -1) { return null }
    const splitPoints = [
            ...nthLastIndicesOf(',', tweet, 4),
            tweet.lastIndexOf(';')
          ],
          text = tweet.substring(0, splitPoints[0]),
          user = tweet.substring(splitPoints[0]+1, splitPoints[1]),
          lat = parseFloat(tweet.substring(splitPoints[1]+1, splitPoints[2])),
          lon = parseFloat(tweet.substring(splitPoints[2]+1, splitPoints[3])),
          timeStr = tweet.substring(splitPoints[3]+1, splitPoints[4]),
          timeData = this.parseDateStr(timeStr)

    return Object.assign({ text, user, lat, lon }, timeData)
  }

  parseDateStr(dateStr) {
    const dateRegex = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
          match = dateStr.match(dateRegex)

    const [ , ...dateParts ] = match,
          [ year, month, day,
            hour, minute, second ] = dateParts.map(parseInt)

    return { year, month, day, hour, minute, second }
  }

  toGeoJson() {
    let tweetJson = turf.featureCollection(this.tweets.map(tweet => {
      const { text, user,
              year, month, day,
              hour, minute, second } = tweet

      return turf.point([tweet.lon, tweet.lat], {
        text, user,
        year, month, day,
        hour, minute
      })
    }))

    return tweetJson
  }
}

module.exports = function(tweets) {
  this.cacheable()
  let tp = new TweetParser()
  tp.parseTweets(tweets)

  return `module.exports=${JSON.stringify(tp.toGeoJson())}`
}
