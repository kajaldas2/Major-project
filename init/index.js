const mongoose = require("mongoose");
const Listing = require("../models/listing");
const data = require("./data");

// Connect to MongoDB
main().then(() => {
    console.log("Database connected");
}).catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// Seed database
const initDB = async () => {
    await Listing.deleteMany({});
    data.data = data.data.map((obj) => ({...obj, owner: "6807d8dda9281a71905e194f"}));
    await Listing.insertMany(data.data);
    console.log("Database seeded successfully!");
};

initDB();
