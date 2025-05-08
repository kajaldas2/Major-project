if(process.env.NODE_ENV !="production") {
    require('dotenv').config();
}

//console.log(process.env.SECRET);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listing');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const ExpressError = require("./utils/ExpressError.js");

//const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listings = require("./routes/listing.js");
const {validateReview, isReviewAuthor,} = require("./middleware.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
//const { isLoggedIn } = require("./views/middleware.js");
const { isLoggedIn, isOwner, validateListing } = require("./middleware.js");

const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/reviews.js");
const multer  = require('multer')
const {storage} = require("./cloudConfig.js");
const upload = multer({ storage });













// MongoDB connection
//mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));




// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "mysupersecretcode",
    },
    touchAfter: 24 * 3600,

});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});







const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookies: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 *  60 * 1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    
    next();
});






//App Get
app.use("/", userRouter); // ✅ RIGHT

//app.use("/", User);
app.get("/demouser", async (req,res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student",
    });

    User.register(fakeUser,"helloworld");

    let registeredUser = await User.register(fakeUser,"helloworld");
    res.send(registeredUser);
});








// Utility wrapper for async routes
const wrapAsync = fn => (req, res, next) => {
    fn(req, res, next).catch(next);
};



   
   

// Index route
app.get("/listings", wrapAsync(listingController.index))




    
// New route
app.get("/listings/new", isLoggedIn, listingController.renderNewForm);

// Create route
app.post("/listings", isLoggedIn,upload.single("listing[image]"),validateListing,
 wrapAsync(listingController.createListing));

  
  


    

    
        

    
   

// Show route
app.get("/listings/:id", wrapAsync(listingController.showListing));





// Edit route
app.get("/listings/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update route
app.put("/listings/:id",isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));

// Delete route
app.delete("/listings/:id",isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));




//Reviews
//POST ROUTE


app.post("/listings/:id/reviews",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));
     


//DELETE REVIEW ROUTE
app.delete("/listings/:id/reviews/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));
  


// Catch-all route for 404 errors
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
  });

// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    //res.status(statusCode).send(message);
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});

