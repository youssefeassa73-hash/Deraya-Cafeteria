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
      description: 'أضف الأقسام التي تريد إخفاءها من المنيو (Add sections you want to hide)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}]
        }
      ],
    },
    {
      name: 'hideOffers',
      title: 'إخفاء قسم العروض (Hide Offers Section) 🎁',
      description: 'فعل هذا الخيار لإخفاء قسم العروض والخصومات من الموقع تماماً (Toggle to hide all offers/discounts on the website)',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'walletNumber',
      title: 'رقم محفظة الدفع الإلكتروني أونلاين (Online Wallet Number) 💳',
      description: 'أدخل رقم المحفظة الإلكترونية (فودافون كاش، اتصالات كاش، إلخ) لاستقبال التحويلات. سيتم عرضه للزبائن في إيصال الشراء أونلاين.',
      type: 'string',
      initialValue: '01096441391',
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
