import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas/index.js'

// Define the custom structure to group items by section
const myStructure = (S) =>
  S.list()
    .title('Deraya Cafeteria')
    .items([
      // 1. NOT CONFIRMED ORDERS (الطلبات الجديدة)
      S.listItem()
        .title('الطلبات الجديدة ⚠️ (New Orders)')
        .child(
          S.documentList()
            .title('الطلبات الجديدة')
            .schemaType('order')
            .filter('_type == "order" && status == "not_confirmed"')
        ),

      // 2. PAID ORDERS (الطلبات المدفوعة)
      S.listItem()
        .title('الطلبات المدفوعة 💰 (Paid Orders)')
        .child(
          S.documentList()
            .title('الطلبات المدفوعة')
            .schemaType('order')
            .filter('_type == "order" && status == "paid"')
        ),

      // 3. DONE ORDERS (الطلبات المكتملة)
      S.listItem()
        .title('الطلبات المكتملة ✓ (Done Orders)')
        .child(
          S.documentList()
            .title('الطلبات المكتملة')
            .schemaType('order')
            .filter('_type == "order" && status == "done"')
        ),

      S.divider(),

      // 4. MENU & SETTINGS FOLDER (ALL COLLAPSED SECTIONS)
      S.listItem()
        .title('إدارة الموقع والمنيو ⚙️ (Menu & Site Settings)')
        .child(
          S.list()
            .title('إدارة الموقع والمنيو')
            .items([
              // Site Settings (Singleton)
              S.listItem()
                .title('إعدادات الموقع (Site Settings)')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              
              S.divider(),

              // Special Offers
              S.listItem()
                .title('العروض الخاصة (Special Offers)')
                .child(
                  S.documentTypeList('offer')
                    .title('العروض الخاصة (Special Offers)')
                ),

              S.divider(),

              // Menu by Category/Section
              S.listItem()
                .title('أقسام المنيو (Menu Sections)')
                .child(
                  S.list()
                    .title('أقسام المنيو (Menu Sections)')
                    .items([
                      S.listItem()
                        .title('الفطار (Breakfast)')
                        .child(
                          S.documentList()
                            .title('الفطار')
                            .schemaType('menuItem')
                            .filter('_type == "menuItem" && category == "الفطار"')
                        ),
                      S.listItem()
                        .title('السندوتشات (Sandwiches)')
                        .child(
                          S.documentList()
                            .title('السندوتشات')
                            .schemaType('menuItem')
                            .filter('_type == "menuItem" && category == "السندوتشات"')
                        ),
                      S.listItem()
                        .title('الكرييب (Crepes)')
                        .child(
                          S.documentList()
                            .title('الكرييب')
                            .schemaType('menuItem')
                            .filter('_type == "menuItem" && category == "الكرييب"')
                        ),
                      S.listItem()
                        .title('الوجبات (Meals)')
                        .child(
                          S.documentList()
                            .title('الوجبات')
                            .schemaType('menuItem')
                            .filter('_type == "menuItem" && category == "الوجبات"')
                        ),
                      S.listItem()
                        .title('البيتزا (Pizza)')
                        .child(
                          S.documentList()
                            .title('البيتزا')
                            .schemaType('menuItem')
                            .filter('_type == "menuItem" && category == "البيتزا"')
                        ),
                    ])
                ),
              
              S.divider(),
              
              // All Menu Items (Fallback)
              S.listItem()
                .title('كل الأطباق (All Menu Items)')
                .child(
                  S.documentTypeList('menuItem')
                    .title('كل الأطباق')
                ),
            ])
        ),
    ])

export default defineConfig({
  name: 'deraya-cafeteria',
  title: 'Deraya Cafeteria',
  projectId: 'ksse299y',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: myStructure
    }),
    visionTool()
  ],
  schema: {
    types: schemaTypes,
  },
})

// Silent background old unpaid orders cleaner inside Sanity Studio (runs every 30 seconds)
if (typeof window !== 'undefined') {
  const SANITY_PROJECT_ID = 'ksse299y';
  const SANITY_DATASET = 'production';
  const SANITY_API_VERSION = '2021-06-07';
  const SANITY_WRITE_TOKEN = 'sky3A8Tg8i5MbEfvEdqM5MQ3GDW9iLrXpuWf1b1zFIHPvHsBFMV8G4oZ5xgD8cCrkNEQYcXDCB2IwRXlAygdhalYBkB541di2BB6w7VpJhYjKjPm4nQqLlLhM4xUOcrNuaG1U7Lj4RXfPj5zRkx2uRuU3A3Z9AFIldtqHMQsCCLWe52srfu9';

  async function studioCleanupUnpaidOrders() {
    try {
      const query = encodeURIComponent('*[_type == "order" && status == "not_confirmed"]{_id, _createdAt}');
      const queryUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;
      
      const res = await fetch(queryUrl);
      const data = await res.json();
      const unpaidOrders = data.result;
      
      if (!unpaidOrders || unpaidOrders.length === 0) return;

      const now = new Date();
      const fortyMinutesAgo = 40 * 60 * 1000;
      const idsToDelete = [];

      unpaidOrders.forEach(order => {
        const createdTime = new Date(order._createdAt);
        if (now - createdTime > fortyMinutesAgo) {
          idsToDelete.push(order._id);
        }
      });

      if (idsToDelete.length === 0) return;

      console.log(`[Studio GC] Cleaning up ${idsToDelete.length} unpaid orders older than 40 minutes...`);

      const mutateUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`;
      const mutations = {
        mutations: idsToDelete.map(id => ({ delete: { id } }))
      };

      await fetch(mutateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SANITY_WRITE_TOKEN}`
        },
        body: JSON.stringify(mutations)
      });
      console.log('[Studio GC] Old unpaid orders cleaned up successfully!');
    } catch (error) {
      console.error('[Studio GC] Error cleaning up old unpaid orders:', error);
    }
  }

  // Run immediately on dashboard boot
  studioCleanupUnpaidOrders();
  // And run every 30 seconds to keep it perfectly clean in real-time
  setInterval(studioCleanupUnpaidOrders, 30000);
}

