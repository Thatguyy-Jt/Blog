// server/seedCategories.js
const mongoose = require('mongoose');
const { Category } = require('./models/Category'); // adjust path if different
const connectDB = require('./config/db'); // adjust path if different

const categories = [
  { name: 'Health', slug: 'health', description: 'All health-related posts' },
  { name: 'Technology', slug: 'technology', description: 'Tech news and tutorials' },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle tips and stories' },
];

async function seed() {
  try {
    await connectDB();
    await Category.deleteMany(); // clear old categories
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
