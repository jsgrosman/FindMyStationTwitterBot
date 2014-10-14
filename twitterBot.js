var Twit = require('./node_modules/twit');
var stationsearch = require("./lib/stationsearch")();
var settings = require('./lib/settings.js');

var T = new Twit({
    consumer_key:         settings.consumer_key
  , consumer_secret:      settings.consumer_secret
  , access_token:         settings.access_token
  , access_token_secret:  settings.access_token_secret
});

var stream = T.stream('statuses/filter', { track: settings.twitterAccount });

stream.on('tweet', function(tweet) {
   
    var tweetText = tweet.text;
    console.log(tweetText);
    
    // only look for tweets that start with the twitter account name
    if (tweetText.toLowerCase().indexOf(settings.twitterAccount.toLowerCase()) === 0) {

        var tweetUser = tweet.user.screen_name;
        console.log(tweetUser);
        
        var regEx = new RegExp(settings.twitterAccount, "ig");
        var searchTerm = tweetText.replace(regEx, '').trim();
        console.log(searchTerm);
        
        stationsearch.search(searchTerm, function(resp) {
            console.log("RESP: " + resp);
            
            T.post('statuses/update', { status: '@' + tweetUser + ' ' + resp, in_reply_to_status_id : tweet.id_str }, function(err, data, response) {
                  if (err) {
                      console.log(err);
                  }
                      
              });
         });
    }
    
    
    
});