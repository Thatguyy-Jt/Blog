// --- Converted to CommonJS (controllers/categoryController.js) ---
const { Category } = require('../models/Category.js');

async function listCategories(_req, res) {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
}

async function createCategory(req, res) {
  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'name and slug required' });
  const exists = await Category.findOne({ $or: [{ name }, { slug }] });
  if (exists) return res.status(409).json({ message: 'Category exists' });
  const cat = await Category.create({ name, slug: slug.toLowerCase(), description });
  res.status(201).json(cat);
}

async function updateCategory(req, res) {
  const { name, slug, description } = req.body;
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Not found' });
  if (name !== undefined) cat.name = name;
  if (slug !== undefined) cat.slug = slug.toLowerCase();
  if (description !== undefined) cat.description = description;
  await cat.save();
  res.json(cat);
}

async function deleteCategory(req, res) {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Not found' });
  await cat.deleteOne();
  res.json({ message: 'Deleted' });
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
