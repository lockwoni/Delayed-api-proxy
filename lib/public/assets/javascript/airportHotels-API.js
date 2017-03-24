//===========================================declaring and setting variables=============================================
var myObject = {}, airportName = $("#see-DOM-for-ID");
var checkInDate = new Date(), checkOutDate = new Date(), amadeusAuth = "TppXrVyzrRIqOWzvMyPsAO253AZe9mhK";

checkInDate = moment(checkInDate).format("YYYY-MM-DD");
checkOutDate = moment().add(2, "days").format("YYYY-MM-DD");

var amadeusLink = "https://api.sandbox.amadeus.com/v1.2/hotels/search-airport?apikey="+amadeusAuth+"&location=SFO&check_in="
+checkInDate+"&check_out="+checkOutDate+"&amenity=RESTAURANT&amenity=INTERNET_PUBLIC_AREAS&number_of_results=5";

>>>>>>> 9305977b1cb42b67de6d07d3281950f64538bc15

//call firebase property to insert into the check in/out query in the link below

//============================================================events======================================================
$.ajax({
	url: amadeusLink,
	method: "GET"
}).done(function(amadeusData){

	var hotels = amadeusData.results;

	//firebase variable.ref().on("child_added", function(childSnapshot){

	console.log("This is the link used in ajax's url: "+amadeusLink);
	for (var i = 0; i < hotels.length; i++){

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

		$("#hotelAddress")
		.append(myObject.name+"<br>"+myObject.address+"<br>"+myObject.city+", "+myObject.state+", "+myObject.zip+"<br>"+myObject.country+"<br><span><strong>The price of stay: $"+
		myObject.price+"</strong></span><br><span>Restaurant and/or internet access at this hotel: "+myObject.amenities+".</span><br><span>Summary of room info: "+
		myObject.description+"</span><br><span>Phone number: "+myObject.phone+"</span><br><span>Hotel bed type: "+myObject.bed+"</span><br><span>Hotel rating: "+
		myObject.rating+"</span><hr>");//figure out how to write hotel ratings and room type if true to DOM====Answer see myObject for answer
		
		//console.log("link to hotel: "+amadeusData.results[0].images[0]);
	}//});
	
	
});
>>>>>>> 9305977b1cb42b67de6d07d3281950f64538bc15
