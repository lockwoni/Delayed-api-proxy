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
            if (!snapshot.exists()) {
                getFlight(user);
            } else {
                var now = moment().startOf('d');
                var departure = moment(snapshot.val().departureDate);

                if (departure >= now) {
                    //Load data from firebase into DOM if there is a flight in progress i.e. current time is less than expected departure
                    loadFlight(user);
                } else {
                    //If flight info is older than current time bring up form to input flight details
                    getFlight(user);
                }
            }
        })
    }

    function loadFlight(user) {
        db.ref('/users/').child(user).once('value', function(snapshot) {
            var flightCarrier = snapshot.val().flightCarrier;
            var flightNum = snapshot.val().flightNum;
            var departureAirport = snapshot.val().departureAirport;
            var departureDate = snapshot.val().departureDate;
            console.log(flightCarrier);
            var table = $('#flightInfoBody');
            $('#flightInfoBody tbody tr').remove();
            var tbody = $('<tbody>');
            var row = $('<tr>');
            row.append('<td>' + flightCarrier + '</td>').append('<td>' + flightNum + '</td>').append('<td>' + departureAirport + '</td>').append('<td>' + departureDate + '</td>');
            tbody.append(row);
            table.append(tbody);
            $('#resubmit').on('click', function() {
                getFlight(user);
            })
        })
    }

    //Pull in flight and user info from form and push to firebase
    function getFlight(user) {
        $('#flightForm').removeClass('hidden');
        $('#submitFlight').on('click', function(event) {
            event.preventDefault();
            var flightCarrier = $('#flightCarrier').val().trim();
            var flightNum = $('#flightNum').val().trim();
            var departureAirport = $('#departureAirport').val().trim();
            var departureDate = $('#departureDate').val();
            var threeDaysOut = moment().add(3, 'd');
            var warning = $('<h3>');
            warning.text('Flights can not be tracked when scheduled to depart more than three days from the current time!');
            if (moment(departureDate) > threeDaysOut) {
                $('#warning').html(warning);
            } else if (moment(departureDate) < moment().startOf('day')) {
                $('#warning').html('<h3>Choose a Valid Date</h3>');
            }
            //TODO Format date to make Flight Stats API call easier moment(departureDate).format()
            else {
                $('#warning').html('');
                $('#flightForm').addClass('hidden');
                setFlight(user, flightCarrier, flightNum, departureAirport, departureDate);
                loadFlight(user);
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
            $('#navbar').removeClass('hidden');
            $('#flightInfo').removeClass('hidden');
            var userID = firebase.auth().currentUser.uid;
            var displayName = firebase.auth().currentUser.displayName;
            //TODO: Check old flight info
            checkFlight(userID);
        } else {
            $('#navbar').addClass('hidden');
            $('#flightInfo').addClass('hidden');
            $('#flightForm').addClass('hidden');
            var ui = new firebaseui.auth.AuthUI(firebase.auth());
            // The start method will wait until the DOM is loaded.
            ui.start('#firebaseui-auth-container', uiConfig);
        }
    });
});
