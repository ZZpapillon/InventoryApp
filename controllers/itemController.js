const Item = require("../models/item");
const Category = require("../models/category")
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");




exports.index = asyncHandler(async (req, res, next) => {
  // Get details of items and other relevant counts (in parallel)
  const [numItems, numCategories] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
  ]);

  // Render the view with the obtained data
  res.render('index', {
  title: 'Inventory Home',
  numItems: numItems,
  numCategories: numCategories,
});

});


// Display list of all Items.
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, "name category")
     .sort({name: 1})
     .populate("category")
     .exec()
  
  res.render("item_list", {title: "Item list", item_list: allItems});
});



exports.item_detail = asyncHandler(async (req, res, next) => {
  const itemId = req.params.id;
  const item = await Item.findById(itemId).populate("category").exec();

  if (!item) {
    const error = new Error("Item not found");
    error.status = 404;
    throw error;
  }

  res.render("item_detail", { title: "Item Detail", item: item });
});


// Display Item create form on GET.
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  
  res.render("item_form", {
    title: "Create Item",
    categories: allCategories,
  });
});


// Handle Item create on POST.
exports.item_create_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("isbn", "ISBN must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("category", "Category must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      isbn: req.body.isbn,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form.
      const allCategories = await Category.find()
        .sort({ name: 1 })
        .exec();

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item.
      await item.save();
      res.redirect(item.formattedUrl);
    }
  }),
];

// Display Item delete form on GET.
// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    res.redirect("/catalog/items");
  }

  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});

// Handle Item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.body.itemid).exec();

  if (item === null) {
    res.redirect("/catalog/items");
    return;
  }

  await Item.findByIdAndDelete(req.body.itemid);
  res.redirect("/catalog/items");
});


// Display Item update form on GET.
// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item and categories for form.
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).populate("category").exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    // No results.
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_form", {
    title: "Update Item",
    categories: allCategories,
    item: item,
  });
});

// Handle item update on POST.
exports.item_update_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped/trimmed data and old id.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all categories for form
      const allCategories = await Category.find().sort({ name: 1 }).exec();

      res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      // Redirect to item detail page.
      res.redirect(updatedItem.formattedUrl);
    }
  }),
];

