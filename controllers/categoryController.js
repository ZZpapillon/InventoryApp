const Category = require("../models/category");
const Item = require("../models/item")
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all Categories.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}).exec();

  // Create an object to store the count of items for each category
  const categoryItemCounts = {};

  // Fetch all items and count the number of items for each category
  const allItems = await Item.find({}).exec();
  allItems.forEach((item) => {
    const categoryId = item.category.toString(); // Convert ObjectId to string for comparison
    categoryItemCounts[categoryId] = (categoryItemCounts[categoryId] || 0) + 1;
  });

  // Update each category with the item count
  allCategories.forEach((category) => {
    const categoryId = category._id.toString(); // Convert ObjectId to string for comparison
    category.count = categoryItemCounts[categoryId] || 0;
  });

  res.render("category_list", { title: "Categories list", categories: allCategories });
});






// Display detail page for a specific Category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.id;

  // Find the category by ID
  const category = await Category.findById(categoryId).exec();

  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }

  // Find all items belonging to this category
  const items = await Item.find({ category: category._id }).exec();

  res.render('category_detail', {
    title: 'Category Detail',
    category: category,
    items: items,
  });
});

// Display Category create form on GET.
exports.category_create_get = asyncHandler(async (req, res, next) => {
  
  res.render("category_form", { title: "Create Category" });
});

// Handle Category create on POST.

exports.category_create_post = [
  // Validate and sanitize fields.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category name must be specified."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Category description must be specified."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save category.
      await category.save();
      // Redirect to new category record.
      res.redirect(category.formattedUrl);
    }
  }),
];


// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all items in that category (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, "name description").exec(),
  ]);

  if (category === null) {
    // No results.
    res.redirect("/catalog/categories");
    return; // End the function execution here
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    category_items: allItemsByCategory,
  });
});


exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all items in that category (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (allItemsByCategory.length > 0) {
    // Category has items. Render in the same way as for GET route.
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      category_items: allItemsByCategory,
    });
    return;
  } else {
    // Category has no items. Delete object and redirect to the list of categories.
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect("/catalog/categories");
  }
});


// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  // Get category details.
  const category = await Category.findById(req.params.id).exec();
  
  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

// Handle Category update on POST.
// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object with escaped/trimmed data and old id.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedCategory = await Category.findByIdAndUpdate(req.params.id, category, {});
      // Redirect to category detail page.
      res.redirect(updatedCategory.formattedUrl);
    }
  }),
];
