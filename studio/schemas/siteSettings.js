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
      name: 'orderStatus',
      title: 'حالة استقبال الطلبات (Ordering Status)',
      description: 'اختر حالة استقبال الطلبات لتحديث الموقع تلقائياً (Select ordering state to update the website)',
      type: 'string',
      options: {
        list: [
          {title: 'مفتوح واستقبال الطلبات متاح 🟢 (Available)', value: 'available'},
          {title: 'مغلق حالياً ولا يمكن الطلب 🔴 (Closed)', value: 'closed'},
          {title: 'مزدحم حالياً والطلب متوقف مؤقتاً 🟡 (Busy)', value: 'busy'},
        ],
        layout: 'radio',
      },
      initialValue: 'available',
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
    {
      name: 'hideOffers',
      title: 'إخفاء قسم العروض (Hide Offers Section) 🎁',
      description: 'فعل هذا الخيار لإخفاء قسم العروض والخصومات من الموقع تماماً (Toggle to hide all offers/discounts on the website)',
      type: 'boolean',
      initialValue: false,
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
