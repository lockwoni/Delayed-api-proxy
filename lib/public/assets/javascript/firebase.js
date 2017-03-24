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
    db.ref('/users').once('value', function(snapshot) {
        if (snapshot.val().inProgress === true) {
            //Load data from firebase into DOM if there is a flight in progress i.e. current time is less than expected departure
        } else {
            //If no current flight info bring up form to input flight details
            getFlight(user);
        }
    })
}

function getFlight(user) {
    //Pull in flight and user info from form and push to firebase
    //$('#flightForm').toggleClass('hidden');
    console.log('getting flight');
    $('#flightForm').toggleClass('hidden');

    //TODO: Push flight details to firebase
    $('#submitFlight').on('click', function() {
        var flightCarrier = $('#flightCarrier').val().trim();
        var flightNum = $('#flightNum').val().trim();
        var departureAirport = $('#departureAirport').val().trim();
        var departureDate = $('#departureDate').val();
        console.log(flightCarrier, flightNum, departureAirport, departureDate);
        setFlight(user);
    })
}

function setFlight(user) {
    db.ref('/users').child(user).set({
        name: name,
        UID: user,
        flightNum: 1894,
        delayTime: 25,
        inProgress: false
    })
}

// Initialize the FirebaseUI Widget using Firebase.
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        //Hide SignIn Panel
        $('#signIn').toggleClass('hidden');
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
