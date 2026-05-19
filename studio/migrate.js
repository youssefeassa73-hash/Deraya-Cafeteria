const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'ksse299y',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2021-06-07',
  token: 'sky3A8Tg8i5MbEfvEdqM5MQ3GDW9iLrXpuWf1b1zFIHPvHsBFMV8G4oZ5xgD8cCrkNEQYcXDCB2IwRXlAygdhalYBkB541di2BB6w7VpJhYjKjPm4nQqLlLhM4xUOcrNuaG1U7Lj4RXfPj5zRkx2uRuU3A3Z9AFIldtqHMQsCCLWe52srfu9',
});

async function migrate() {
  console.log('Fetching existing menu items...');
  const items = await client.fetch('*[_type == "menuItem"]');
  console.log(`Found ${items.length} menu items.`);

  // Find all unique categories from existing items
  const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
  console.log('Unique string categories found:', uniqueCategories);

  // Map to store category string -> category document ID
  const categoryIdMap = {};

  // Create Category documents for each unique category
  for (const [index, catName] of uniqueCategories.entries()) {
    // Check if category already exists
    const existingCat = await client.fetch('*[_type == "category" && name == $name][0]', { name: catName });
    if (existingCat) {
      console.log(`Category document for "${catName}" already exists. ID: ${existingCat._id}`);
      categoryIdMap[catName] = existingCat._id;
    } else {
      console.log(`Creating Category document for "${catName}"...`);
      const newCat = await client.create({
        _type: 'category',
        name: catName,
        order: index + 1
      });
      console.log(`Created! ID: ${newCat._id}`);
      categoryIdMap[catName] = newCat._id;
    }
  }

  // Update existing menu items to use categoryRef
  for (const item of items) {
    if (item.category && categoryIdMap[item.category]) {
      console.log(`Updating item "${item.name}" (${item._id}) to reference category "${item.category}"...`);
      await client
        .patch(item._id)
        .set({
          categoryRef: {
            _type: 'reference',
            _ref: categoryIdMap[item.category]
          }
        })
        .commit();
      console.log(`Updated item "${item.name}"`);
    }
  }

  console.log('Migration complete!');
}

migrate().catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});
