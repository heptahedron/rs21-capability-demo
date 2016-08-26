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
    tweets.split('\n').map(t => t.trim()).forEach(tweet => {
      const tweetData = this.parseTweet(tweet)
      console.log(tweetData)
      if (!(--n)) process.exit()
    })
  }

  parseTweet(tweet) {
    const splitPoints = [
      ...nthLastIndicesOf(',', tweet, 4),
      tweet.lastIndexOf(';')
    ]

    return {
      text: tweet.substring(0, splitPoints[0]),
      user: tweet.substring(splitPoints[0], splitPoints[1]),
      lat: tweet.substring(splitPoints[1], splitPoints[2]),
      lon: tweet.substring(splitPOints[2], splitPoints[3])
    }
  }

  toGeoJson() {
  
  }
}

module.exports = function(tweets) {
  let tp = new TweetParser()
  tp.parseTweets(tweets)

  return `module.exports=${tp.toGeoJson()}`
}
