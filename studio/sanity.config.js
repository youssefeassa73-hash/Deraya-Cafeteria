import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas/index.js'

// Define the custom structure to group items by section
const myStructure = (S) =>
  S.list()
    .title('Deraya Cafeteria')
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
      
      S.divider(),

      // Orders (الطلبات)
      S.listItem()
        .title('الطلبات (Orders)')
        .child(
          S.documentTypeList('order')
            .title('الطلبات (Orders)')
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

