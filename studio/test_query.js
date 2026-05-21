const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'ksse299y',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2021-06-07',
});

async function testQuery() {
  const settingsArr = await client.fetch('*[_type == "siteSettings"][0..0]{..., "hiddenCategories": hiddenCategories[]->name}');
  console.log('Settings:', settingsArr);
}

testQuery().catch(console.error);
