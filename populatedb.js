#! /usr/bin/env node

console.log(
  'This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require("./models/category");
const Item = require("./models/item");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function categoryCreate(name, description) {
  const category = new Category({
    name: name,
    description: description,
  });
  await category.save();
  categories.push(category);
  console.log(`Added category: ${name}`);
}

async function itemCreate(name, description, price, isbn, category) {
  const item = new Item({
    name: name,
    description: description,
    price: price,
    isbn: isbn,
    category: category,
  });
  await item.save();
  items.push(item);
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate("Furniture", "A collection of furniture items for your home."),
    categoryCreate("Electronics", "The latest gadgets and electronics."),
    categoryCreate("Clothing", "Trendy clothing items for men and women."),
    categoryCreate("Books", "A wide selection of books for all ages."),
    categoryCreate("Toys", "Fun toys and games for kids."),
  ]);
}

async function createItems() {
  console.log("Adding items");
  await Promise.all([
    itemCreate("Wooden Coffee Table", "Solid oak coffee table with elegant design.", 199.99, "9781473211896", categories[0]),
    itemCreate("Smart TV", "4K Ultra HD smart TV with built-in streaming apps.", 799.99, "9788401352836", categories[1]),
    itemCreate("Leather Jacket", "Genuine leather jacket with zippered pockets.", 149.99, "9780756411336", categories[2]),
    itemCreate("Best-Selling Novel", "New York Times bestseller for fiction lovers.", 12.99, "9780765379528", categories[3]),
    itemCreate("LEGO Star Wars Set", "Build your own Star Wars adventure with LEGO bricks.", 59.99, "9780765379504", categories[4]),
    itemCreate("Antique Dresser", "Vintage dresser with hand-carved details.", 299.99, "ISBN111111", categories[0]),
    itemCreate("Wireless Headphones", "Noise-canceling wireless headphones for immersive audio.", 129.99, "ISBN222222", categories[1]),
    itemCreate("Designer Dress", "Elegant designer dress for special occasions.", 199.99, "ISBN333333", categories[2]),
    itemCreate("Classic Mystery Novel", "A thrilling mystery novel that keeps you guessing until the end.", 9.99, "ISBN444444", categories[3]),
    itemCreate("LEGO City Police Set", "Build your own police station and catch the bad guys.", 39.99, "ISBN555555", categories[4]),
  ]);
}
