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

// Storing the API key and base URL
var APIKey = "166a433c57516f51dfab1f7edaed8413";
var baseURL = "http://api.openweathermap.org/data/2.5/weather?";

// Creating variables to store data from firebase and an array that they will be pushed to  
var airportCity = [];
var airportCity1 = "";
var airportCity2 = "";

//FUNCTIONS
function loadWeather(airportCity) {
    // AJAX GET request
    $.ajax({
            url: baseURL + "q=" + airportCity + "&units=imperial&appid=" + APIKey,
            method: "GET"
        })
        .done(function(response) {
            console.log(response);
            // Creating a div for the flight(s)
            var weatherDiv = $("<div class='weather col-md-12'>");
            weatherDiv.attr("class", "col-md-6")
                // Storing the weather data
            var temp = response.main.temp;
            var description = response.weather[0].description;
            var icon = response.weather[0].icon;
            var clouds = response.clouds.all;
            var humidity = response.main.humidity;
            var wind = response.wind.speed;
            var timeUpdated = response.dt;

            // Creating <img> with the weather icon
            var weatherIcon = $("<img>");
            weatherIcon.attr("src", "http://openweathermap.org/img/w/" + icon + ".png");

            // Creating a header tag with the carrier and flight number
            var h2 = $("<h2>").text(airportCity + " Weather");

            // Creating paragraph tags with the result item's temp
            var p1 = $("<p>").text("Current weather: " + description);
            var p2 = $("<p>").text("Temperature: " + Math.floor(temp) + "\xB0 F");
            var p3 = $("<p>").text("Cloudiness: " + clouds + "%");
            var p4 = $("<p>").text("Wind: " + Math.floor(wind) + " miles per hour");
            var p5 = $("<p>").text("Humdity: " + humidity + "%");
            var p6 = $("<p>").text("Last updated: " + moment(timeUpdated).format("LT")).attr("class", "text-muted updatedStamp");

            // Appending the weather info to the weatherDiv
            weatherDiv.append(weatherIcon, h2, p1, p2, p3, p4, p5, p6);

            // Prepending the weatherDiv to the "#weather-container" div in the HTML
            $("#weather-container").prepend(weatherDiv);
        })
        .fail(function(err) {
            console.error(err);
        });
}

//MAIN PROCESSES
$(document).ready(function() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log(auth.currentUser.uid);
            var uid = auth.currentUser.uid;
            db.ref().child('/users/').child(uid).once('value', function(snapshot) {
                if (snapshot.val() !== null) {

                    airportCity1 = snapshot.val().airportCity1;
                    console.log(airportCity1);

                    airportCity2 = snapshot.val().airportCity2;
                    console.log(airportCity2);

                    airportCity.push(airportCity1);
                    airportCity.push(airportCity2);



                    for (var i = 0; i < airportCity.length; i++) {
                        loadWeather(airportCity[i]);
                    }
                }
            });
        } else {
            console.log('No user');
        };
    });
});
