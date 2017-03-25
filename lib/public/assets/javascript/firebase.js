$(function() {
    var config = {
        apiKey: "AIzaSyCElE1dM3EpZqMtruXeUm-AaKAVpcwDfrI",
        authDomain: "delayed-da2a0.firebaseapp.com",
        databaseURL: "https://delayed-da2a0.firebaseio.com",
        storageBucket: "delayed-da2a0.appspot.com",
        messagingSenderId: "922822256464"
    };

    firebase.initializeApp(config);

    var db = firebase.database();

    var uiConfig = {
        //TODO: https://gt-delayed.herokuapp.com/
        signInSuccessUrl: 'http://localhost:1337',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: 'https://gt-delayed.herokuapp.com/'
    };

    function checkFlight(user) {
        db.ref('/users').child(user).once('value', function(snapshot) {
            var now = moment();
            var departure = moment(snapshot.val().departureDate);
            console.log(departure);
            if (departure > now) {
                //Load data from firebase into DOM if there is a flight in progress i.e. current time is less than expected departure
            } else {
                //If no current flight info bring up form to input flight details
                getFlight(user);
            }
        })
    }

    //Pull in flight and user info from form and push to firebase
    function getFlight(user) {
        //$('#flightForm').toggleClass('hidden');
        $('#flightForm').toggleClass('hidden');
        //TODO: Push flight details to firebase
        $('#submitFlight').on('click', function(event) {
            event.preventDefault();
            var flightCarrier = $('#flightCarrier').val().trim();
            var flightNum = $('#flightNum').val().trim();
            var departureAirport = $('#departureAirport').val().trim();
            var departureDate = $('#departureDate').val();
            var threeDaysOut = moment().add(3, 'd');
            var warning = $('<h3>');
            warning.text('Flights can not be tracked when scheduled to depart more than three days from the current time!').attr('id', 'warning');
            if (moment(departureDate) > threeDaysOut) {
                $('#flightForm').after(warning);
            } else if (moment(departureDate) < moment()) {}
            //TODO Format date to make Flight Stats API call easier moment(departureDate).format()
            else {
                console.log(flightCarrier, flightNum, departureAirport, departureDate);
                setFlight(user, flightCarrier, flightNum, departureAirport, departureDate);
                //TODO Make API call and show flight status on DOM
            }
        })
    }

    function setFlight(user, flightCarrier, flightNum, departureAirport, departureDate) {
        var displayName = firebase.auth().currentUser.displayName;
        db.ref('/users').child(user).set({
            name: displayName,
            UID: user,
            flightCarrier: flightCarrier,
            flightNum: flightNum,
            departureAirport: departureAirport,
            departureDate: departureDate
        })
    }

    // Initialize the FirebaseUI Widget using Firebase.
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            //Hide SignIn Panel
            $('#navbar').toggleClass('hidden');
            var userID = firebase.auth().currentUser.uid;
            var displayName = firebase.auth().currentUser.displayName;
            //TODO: Check old flight info
            checkFlight(userID);

            //Listen for flight details to be updated and insert them into DOM
            db.ref('/users/' + userID).on('value', function(snapshot) {
                console.log(snapshot.val());
            })
        } else {
            var ui = new firebaseui.auth.AuthUI(firebase.auth());
            // The start method will wait until the DOM is loaded.
            ui.start('#firebaseui-auth-container', uiConfig);
        }
    });
});
