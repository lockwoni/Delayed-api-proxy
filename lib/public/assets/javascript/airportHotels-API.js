$(function() {
    //====================================base init==========================================================================
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
    var uid;

    //===========================================declaring and setting variables=============================================
    var airportName;
    var myObject = {};
    var checkInDate, checkOutDate;
    var departureAirport;
    var amadeusAuth = "TppXrVyzrRIqOWzvMyPsAO253AZe9mhK";

    // checkInDate = moment(checkInDate).format("YYYY-MM-DD");
    // checkOutDate = moment().add(2, "days").format("YYYY-MM-DD");

    //call firebase property to insert into the check in/out query in the link below

    //============================================================events======================================================
    function getLocation(user) {
        db.ref().child('/users/').child(uid).once('value', function(snapshot) {
            departureAirport = snapshot.val().departureAirport;
            checkInDate = moment(snapshot.val().departureDate).format("YYYY-MM-DD");
            checkOutDate = moment(checkInDate).add(2, 'days').format("YYYY-MM-DD");
            var amadeusLink = "https://api.sandbox.amadeus.com/v1.2/hotels/search-airport?apikey=" + amadeusAuth + "&location=" + departureAirport + "&check_in=" + checkInDate + "&check_out=" + checkOutDate + "&amenity=RESTAURANT&amenity=INTERNET_PUBLIC_AREAS&number_of_results=5";
            amadeus(amadeusLink);
        });
    }

    function amadeus(url) {
        $.ajax({
            url: url,
            method: "GET"
        }).done(function(amadeusData) {

            var hotels = amadeusData.results;

            console.log("This is the link used in ajax's url: " + url);
            for (var i = 0; i < hotels.length; i++) {

                myObject.name = hotels[i].property_name || "N/A";
                myObject.address = hotels[i].address.line1 || "N/A";
                myObject.city = hotels[i].address.city || "N/A";
                myObject.state = hotels[i].address.region || "N/A";
                myObject.zip = hotels[i].address.postal_code || "N/A";
                myObject.country = hotels[i].address.country || "N/A";
                myObject.price = hotels[i].total_price.amount || "N/A";
                myObject.amenities = (Array.isArray(hotels[i].amenities) && hotels[i].amenities.length > 0 && hotels[i].amenities[1].description) || "N/A";
                myObject.description = (Array.isArray(hotels[i].rooms) && hotels[i].rooms.length > 0 && hotels[i].rooms[0].descriptions) || "N/A";
                myObject.phone = (Array.isArray(hotels[i].contacts) && hotels[i].contacts.length > 0 && hotels[i].contacts[0].detail) || "N/A";
                myObject.rating = (Array.isArray(hotels[i].awards) && hotels[i].awards.length > 0 && hotels[i].awards[0].rating) || "N/A";
                myObject.bed = (Array.isArray(hotels[i].rooms) && hotels[i].rooms.length > 0 && hotels[i].rooms[0].room_type_info && hotels[i].rooms[0].room_type_info.bed_type) || "N/A",
                myObject.image = (Array.isArray(hotels[i].image) && hotels[i].image.length > 0 && hotels[i].image[0]) || "N/A";

                $("#textArea")
                    .append(myObject.name + "<br>" + myObject.address + "<br>" + myObject.city + ", " + myObject.state + ", " + myObject.zip + "<br>" + myObject.country + "<br><span><strong>The price of stay: $" +
                        myObject.price + "</strong></span><br><span>Restaurant and/or internet access at this hotel: " + myObject.amenities + ".</span><br><span>Summary of room info: " +
                        myObject.description + "</span><br><span>Phone number: " + myObject.phone + "</span><br><span>Hotel bed type: " + myObject.bed + "</span><br><span>Hotel rating: " +
                        myObject.rating + "</span><hr>"); //figure out how to write hotel ratings and room type if true to DOM====Answer see myObject for answer

                //console.log("link to hotel: "+amadeusData.results[0].images[0]);
            }
        }).fail(function(error) {
            console.log(url);
            console.log(error);
        });
    };

    auth.onAuthStateChanged(function(user) {
        uid = auth.currentUser.uid;
        getLocation(uid);
    })
});
