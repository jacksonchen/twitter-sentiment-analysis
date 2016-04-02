var spawn = require('child_process').spawn,
    oauthSignature = require('oauth-signature'),
    apiParams = {
      oauth_consumer_key : 'UDA0b0ZogUZzk2PAFlBKcaPqB',
      oauth_token : '2922199336-aPKUBmP1kPlIN60WQJkZTh33E9nksBqau19bOVn',
      consumerSecret : '6KUdtbCjjhd1tTzo97dZhxTYmsUPloYbbkLInE2B0Xxnaiys0b',
      tokenSecret : '3tB5YMTbi6glEzpLYuJBjd796kiDYpJuhsOPRF7b3e6ys',
      oauth_timestamp : Date.now(),
      oauth_signature_method : 'HMAC-SHA1',
      oauth_version : '1.1',
      count: 100
    };

function genNonce(callback) {
  var nonceChars = []
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i=0; i < 32; i++) {
    nonceChars.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }
  callback(nonceChars.join(''));
}

// TODO: REMEMBER TO REMOVE SECRETS
function buildSignature(apiParams, callback) {
  var httpMethod = 'GET',
    	url = 'https://api.twitter.com/1.1/search/tweets.json',
    	consumerSecret = apiParams.consumerSecret,
    	tokenSecret = apiParams.tokenSecret;
  delete apiParams.consumerSecret;
  delete apiParams.tokenSecret;
  var signature = oauthSignature.generate(httpMethod, url, apiParams, consumerSecret, tokenSecret, {encodeSignature: false});
  callback(signature);
}

function getTweets(apiParams, callback) {
  genNonce(function(nonce) {
    apiParams.oauth_nonce = nonce;
    buildSignature(apiParams, function(signature) {
      var dataQuery = 'count=100&q=' + encodeURI(apiParams.status) + '&src=typd',
          header = 'Authorization: OAuth oauth_consumer_key=\"' + apiParams.oauth_consumer_key + '\", ' +
                   'oauth_nonce=\"' + apiParams.oauth_nonce + '\", ' +
                   'oauth_signature=\"' + signature + '\", ' +
                   'oauth_signature_method=\"' + apiParams.oauth_signature_method + '\", ' +
                   'oauth_timestamp=\"' + apiParams.timestamp + '\", ' +
                   'oauth_version=\"' + apiParams.oauth_version + '\"',
          child = spawn('curl', [
            '--get', 'https://api.twitter.com/1.1/search/tweets.json',
            '--data', dataQuery,
            '--header', header
          ]);
      var tweetsHash = '';

      child.stdout.on('data', function(err, chunk) {
        if (err) throw err;
        console.log(JSON.parse(chunk.toString()).statuses);
        tweetsHash += chunk;
      });

      child.stdout.on('end', function() {
        // console.log(tweetsHash);
        callback(JSON.parse(tweetsHash.toString()).statuses);
      });
    });
  });
}

// exports.tweets = function compileTweets(callback) {
function compileTweets(topic, apiParams, callback) {
  apiParams.status = topic;
  var tweetArr = []
  getTweets(apiParams, function(tweetsHash) {
    tweetsHash.forEach(function(tweet) {
      tweetArr.push(tweet.text);
    });
    callback(tweetArr);
  });
}

// MAIN

// compileTweets("hi", function(tweetArr) {
//   console.log(tweetArr);
// })
