const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    isbn: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    itemUrl: { type: String },
  }
);

// Virtual for item's URL
ItemSchema.virtual('formattedUrl').get(function () {
  return '/catalog/item/' + this._id;
});

// Export model
module.exports = mongoose.model('Item', ItemSchema);
