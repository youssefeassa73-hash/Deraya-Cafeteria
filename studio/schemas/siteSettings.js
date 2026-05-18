export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'phone',
      title: 'رقم الهاتف (Phone Number)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'hiddenCategories',
      title: 'الأقسام المخفية (Hidden Menu Sections)',
      description: 'اختر الأقسام التي تريد إخفاءها من المنيو على الموقع (Select the sections you want to hide from the live menu on the website)',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'الفطار (Breakfast)', value: 'الفطار'},
          {title: 'السندوتشات (Sandwiches)', value: 'السندوتشات'},
          {title: 'الكرييب (Crepes)', value: 'الكرييب'},
          {title: 'الوجبات (Meals)', value: 'الوجبات'},
          {title: 'البيتزا (Pizza)', value: 'البيتزا'},
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'phone',
    },
    prepare({title}) {
      return {
        title: `Phone: ${title}`,
      }
    },
  },
}
