//SETUP VARIABLES
// Initializing Firebase
var config = {
    apiKey: "AIzaSyCElE1dM3EpZqMtruXeUm-AaKAVpcwDfrI",
    authDomain: "delayed-da2a0.firebaseapp.com",
    databaseURL: "https://delayed-da2a0.firebaseio.com",
    storageBucket: "delayed-da2a0.appspot.com",
    messagingSenderId: "922822256464"
};

firebase.initializeApp(config);

var db = firebase.database();
var auth = firebase.auth();

// Creating variables store data pulled from Firebase
var carrier = "";
var flight = "";
var depAirport = "";
var depDate = "";
var airportCity1 = "";
var airportCity2 = "";

// Creating variables to be called later
var splitDepDate = [];
var year = "";
var month = "";
var day = "";

// Creating arrays of the flight status codes and descriptions
var statusCodeArray = ["A", "C", "D", "DN", "L", "NO", "R", "S", "U"];

var statusDescArray = ["Active", "Canceled", "Diverted", "Data source needed", "Landed", "Not operational", "Redirected", "Scheduled", "UnknownTest"];

// Constructing a URL to pull flight info from Flight Status
var appID = "8cdcbe40";
var appKey = "a1f5e6b741ee63d48fe800c2c45b0dad";


//FUNCTIONS
function splitDate() {
    splitDepDate = depDate.split("-");

    year = splitDepDate[0];
    month = splitDepDate[1];
    day = splitDepDate[2];

    console.log("Departure date array: " + splitDepDate);
};


//MAIN PROCESSES
$(document).ready(function() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log(auth.currentUser.uid);
            var uid = auth.currentUser.uid;
            db.ref().child('/users/').child(uid).once('value', function(snapshot) {
                if (snapshot.val() !== null) {
                    carrier = snapshot.val().flightCarrier;
                    console.log(carrier);
                    depAirport = snapshot.val().departureAirport;
                    console.log(depAirport);
                    depDate = snapshot.val().departureDate;
                    console.log(depDate);
                    flight = snapshot.val().flightNum;
                    console.log(flight);

                    ///add code below///
                    splitDate();
                    // AJAX GET request
                    $.ajax({
                            url: "/api/flightstats/flight/status/" + carrier + "/" + flight + "/dep/" + year + "/" + month + "/" + day + "?appId=" + appID + "&appKey=" + appKey + "&utc=false&airport=" + depAirport,
                            method: "GET"
                        })
                        .done(function(response) {
                            console.log(response);
                            // Deleting the flight info prior to adding new info
                            $("#flight-container").empty();
                            // Storing an array of results in the results variable
                            var results = response.flightStatuses;

                            for (var i = 0; i < results.length; i++) {
                                // Storing variables from the response in an object
                                var flightObj = {
                                    statusCode: results[i].status || "N/A",
                                    arrAirport: results[i].arrivalAirportFsCode || "N/A",
                                    oDepTime: results[i].operationalTimes.publishedDeparture.dateLocal || "N/A",
                                    uDepTime: (Object.prototype.toString.call(results[i].operationalTimes.estimatedGateDeparture) === '[object Object]' && results[i].operationalTimes.estimatedGateDeparture.dateLocal) || "N/A",
                                    oArrTime: results[i].operationalTimes.publishedArrival.dateLocal || "N/A",
                                    uArrTime: (Object.prototype.toString.call(results[i].operationalTimes.estimatedGateArrival) === '[object Object]' && results[i].operationalTimes.estimatedGateArrival.dateLocal) || "N/A",
                                    airportCity1: response.appendix.airports[0].city || "N/A",
                                    airportCity2: response.appendix.airports[1].city || "N/A",
                                };

                                console.log("Arr: " + flightObj.uArrTime);
                                console.log("Dep: " + flightObj.uDepTime);
                                console.log("City 1: " + flightObj.airportCity1);
                                console.log("City 2: " + flightObj.airportCity2);

                                // Pushing airport cities to firebase
                                db.ref().child('/users/').child(uid).update({ "airportCity1": flightObj.airportCity1 });
                                db.ref().child('/users/').child(uid).update({ "airportCity2": flightObj.airportCity2 });

                                // Creating a div for the flight(s)
                                var flightDiv = $("<div class='flight'>");
                                // Creating a header tag with the carrier and flight number
                                var h2 = $("<h2>").text("Your upcoming flight: " + carrier + " " + flight);
                                // Creating a header tag with the carrier and flight number
                                var airportP = $("<p>").text("Departure airport: " + depAirport + " | Arrival airport: " + flightObj.arrAirport);
                                // Storing the flight status and converting to a defined description
                                var statusDesc = statusDescArray[statusCodeArray.indexOf(flightObj.statusCode)];

                                // Calculating estimated delayed/early arrival 
                                var arrDelay = moment(flightObj.uArrTime).diff(moment(flightObj.oArrTime), "minutes");

                                if (isNaN(arrDelay)) {
                                    var delayH = $("<h3>").text("No updated arrival information at this time.");
                                } else if (arrDelay < 0) {
                                    var arrEarly = 0 - arrDelay;
                                    var delayH = $("<h3>").text("Your flight is estimated to arrive " + arrEarly + " minutes early");
                                } else {
                                    var delayH = $("<h3>").text("Your flight is estimated to arrive " + arrDelay + " minutes late");
                                };

                                //Calculating estimated time to departure
                                var timeToDep = moment(flightObj.uDepTime).diff(moment.utc(), "minutes");

                                if (isNaN(timeToDep)) {
                                    var depWindow = $("<h3>").text("");
                                } else if (timeToDep <= 0) {
                                    var depWindow = $("<h3>").text("Your flight has departed.");
                                } else if (timeToDep <= 20 && timeToDep > 0) {
                                    var depWindow = $("<h3>").text("There are just " + timeToDep + " minutes until your flight leaves. The gate is now closed.");
                                } else if (timeToDep <= 45 && timeToDep > 20) {
                                    var depWindow = $("<h3>").text("There are " + timeToDep + " minutes until your flight leaves. Start making your way to the gate now to prepare for boarding.");
                                } else {
                                    var depWindow = $("<h3>").text("There are still " + timeToDep + " minutes until your flight leaves. Relax and enjoy your day!");
                                };

                                // Creating paragraph tags with the flight's status & updated departure/arrival
                                if (flightObj.uArrTime === "N/A") {
                                    var statusH = $("<h3>").text("Flight status: " + statusDesc);
                                    var depTimeP = $("<p>").text("Updated departure time: No updates | Original departure time: " + moment(flightObj.oDepTime).format("h:mm A on ddd, MMM Do"));
                                    var arrTimeP = $("<p>").text("Updated arrival time: No updates | Original arrival time: " + moment(flightObj.oArrTime).format("h:mm A on ddd, MMM Do"));
                                } else {
                                    var statusH = $("<h3>").text("Flight status: " + statusDesc);
                                    var depTimeP = $("<p>").text("Updated departure time: " + moment(flightObj.uDepTime).format("h:mm A on ddd, MMM Do") + " | Original departure time: " + moment(flightObj.oDepTime).format("h:mm A on ddd, MMM Do"));
                                    var arrTimeP = $("<p>").text("Updated arrival time: " + moment(flightObj.uArrTime).format("h:mm A on ddd, MMM Do") + " | Original arrival time: " + moment(flightObj.oArrTime).format("h:mm A on ddd, MMM Do"));
                                };

                                // Appending the flight info to the flightDiv
                                flightDiv.append(h2, statusH, delayH, depWindow, airportP, depTimeP, arrTimeP);

                                // Appending the flightDiv to the "#flight-container" div in the HTML
                                $("#flight-container").append(flightDiv);
                            };
                        }).fail(function(err) {
                            console.error(err);
                        });
                }
            });
        } else {
            console.log('No user');
        };
    });
});
