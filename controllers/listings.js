const Listing = require("../models/listing.js");
const axios = require('axios');


// Forward geocoding (Address → Coordinates)
async function geocodeForward(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
    const response = await axios.get(url, {
        headers: {
            "User-Agent": "Wanderlust-App/1.0"   // REQUIRED for Nominatim
        }
    });

    if (response.data.length === 0) {
        return null;   // No match found
    }

    return {
        lat: response.data[0].lat,
        lng: response.data[0].lon
    };
}



module.exports.index = async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};


module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs")
};


module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path:"author"},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
};



module.exports.createListing = async (req, res) => {

    //  Forward Geocode: Convert location text → coordinates
    const geo = await geocodeForward(req.body.listing.location);

    const newListing = new Listing(req.body.listing);

    //  Add geometry only after newListing is defined
    if (geo) {
        newListing.geometry = {
            type: "Point",
            coordinates: [geo.lng, geo.lat]   // [longitude, latitude]
        };
    }
    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
};



module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing , originalImageUrl});
};



module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

   if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
   }

    req.flash("success", "Listing  Updated!");
    res.redirect(`/listings/${id}`);
};



module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id); 
    req.flash("success", "Listing  Deleted!");
    res.redirect("/listings");
};