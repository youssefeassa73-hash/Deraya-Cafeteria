const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'ksse299y',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2021-06-07',
});

async function testQuery() {
  const items = await client.fetch('*[_type == "menuItem"]{..., "category": categoryRef->name, "categoryOrder": categoryRef->order} | order(categoryOrder asc, category asc, _createdAt asc)');
  console.log('Items category mapped:', items.map(i => i.category));
}

testQuery().catch(console.error);
