export default {
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'اسم الطبق (Dish Name)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'القسم (Category)',
      description: 'أدخل اسم القسم هنا (تأكد من مطابقته للأقسام المضافة في إعدادات الموقع)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'الوصف (Description)',
      type: 'text',
      rows: 2,
    },
    {
      name: 'price',
      title: 'السعر (Price - EGP)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'breadOptions',
      title: 'خيارات العيش المتاحة (Available Bread Options)',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'عيش بلدي (Baladi Bread)', value: 'عيش بلدي'},
          {title: 'عيش فينو (Fino Bread)', value: 'فينو'},
          {title: 'عيش سوري (Syrian Bread)', value: 'سوري'},
        ],
      },
      hidden: ({document}) => 
        !['الفطار', 'السندوتشات'].includes(document?.category),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      price: 'price',
    },
    prepare({title, subtitle, price}) {
      return {
        title: title,
        subtitle: `${subtitle} — ${price} EGP`,
      }
    },
  },
}
