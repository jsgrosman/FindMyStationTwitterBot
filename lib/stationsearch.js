var request = require("../node_modules/request");
var settings = require('./settings.js');

var _ = require('underscore');


module.exports = function() {
    var baseSearchUrl = 'http://api.npr.org/v2/stations/search/';
    var baseStreamsUrl = 'http://api.npr.org/v2/stations/{sid}/streams/';
    var baseProgramUrl = 'http://api.npr.org/v2/streams/{sid}/times/now/programs';

    
    
    
    return {
        search : function(searchTerm, callback) {
            var querySearchUrl = baseSearchUrl + searchTerm + "?apiKey=" + settings.apiKey; // + "&randomize=all";
            console.log(querySearchUrl);
            
            request({
                uri: querySearchUrl,
            }, function(error, response, body) {
                var data = JSON.parse(body);
                if (data.length > 0) {
                    var topStation = data[0];
                    if (topStation !== 0) {

                        var stationGuid = topStation.guid;
                        var queryStreamsUrl = baseStreamsUrl.replace("{sid}", stationGuid) + "?apiKey=" + settings.apiKey;
                        console.log(queryStreamsUrl);

                        request({
                            uri: queryStreamsUrl,
                        }, function(error, response, body) {
                            var data = JSON.parse(body);
                            if (data.length > 0) {
                                // look for a stream that has a station, where the stream is the primary stream of the station
                                var primaryStream = _.find(data, function(stream){ 
                                    return _.some(stream.station, function (st) {
                                        if (st) {
                                            return st.guid === topStation.guid && st.primary_stream;
                                        }
                                        else {
                                            return false;
                                        }
                                    });
                                });

                                if (primaryStream) {
                                    var streamGuid = primaryStream.guid;
                                    var queryProgramUrl = baseProgramUrl.replace("{sid}", streamGuid) + "?apiKey=" + settings.apiKey;
                                    console.log(queryProgramUrl);
                                    request({
                                        uri: queryProgramUrl,
                                    }, function(error, response, body) {
                                        var data = JSON.parse(body);
                                        if (data.length > 0) {
                                            var currentProgram = data[0].name;
                                            callback("Listen to public radio on " + topStation.call + " " + topStation.frequency + topStation.band + " (" + topStation.homepage + "?utm_source=twitter.com&utm_campaign=find_my_station_bot&utm_medium=social). On now: " + currentProgram + ".");
                                        }
                                        else {
                                            callback("Listen to public radio on " + topStation.call + " " + topStation.frequency + topStation.band + " ("  + topStation.homepage + "?utm_source=twitter.com&utm_campaign=find_my_station_bot&utm_medium=social).");
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else {
                        callback("I didn't understand your tweet '" + searchTerm.substring(0,14) + "'. To find your station, enter a zip, city/state, or station call letters.");
                    }
                }
            });
        }
    };
};