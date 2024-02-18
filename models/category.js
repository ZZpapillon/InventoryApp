const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true },
    categoryUrl: { type: String },
  }
);

// Virtual for category's URL
CategorySchema.virtual('formattedUrl').get(function () {
  return '/catalog/category/' + this._id;
});

// Export model
module.exports = mongoose.model('Category', CategorySchema);
