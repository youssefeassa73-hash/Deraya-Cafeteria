export default {
  name: 'order',
  title: 'Orders (الطلبات)',
  type: 'document',
  fields: [
    {
      name: 'status',
      title: 'حالة الطلب (Order Status)',
      type: 'string',
      options: {
        list: [
          {title: 'غير مؤكد (Not Confirmed) ⚠️', value: 'not_confirmed'},
          {title: 'مدفوع (Paid) 💰', value: 'paid'},
          {title: 'مكتمل (Done) ✓', value: 'done'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'not_confirmed',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'totalPrice',
      title: 'السعر الإجمالي (Total Price - EGP) 💰',
      type: 'number',
      validation: (Rule) => Rule.required(),
      readOnly: true,
    },
    {
      name: 'orderNumber',
      title: 'رقم الطلب (Order Number)',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'customerName',
      title: 'اسم العميل (Customer Name)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'customerPhone',
      title: 'رقم الهاتف (Phone Number)',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^01[0-9]{9}$/, {
            name: 'رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01)',
          })
          .error('رقم الهاتف غير صحيح! يجب أن يتكون من 11 رقماً ويبدأ بـ 01'),
    },
    {
      name: 'items',
      title: 'الأطباق المطلوبة (Ordered Items)',
      type: 'text',
      rows: 4,
    },
    {
      name: 'comments',
      title: 'ملاحظات العميل (Customer Notes / Comments)',
      type: 'text',
      rows: 2,
    },
    {
      name: 'createdAt',
      title: 'تاريخ الطلب (Order Date & Time)',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    },
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      customerName: 'customerName',
      customerPhone: 'customerPhone',
      totalPrice: 'totalPrice',
      items: 'items',
    },
    prepare({orderNumber, customerName, customerPhone, totalPrice, items}) {
      // Format items to list inline cleanly in subtitle
      let inlineItems = items ? items.trim().replace(/\n/g, ' ── ') : 'لا يوجد تفاصيل';
      if (inlineItems.length > 60) {
        inlineItems = inlineItems.substring(0, 57) + '...';
      }
      return {
        title: `طلب #${orderNumber || '????'} ── ${customerName || 'بدون اسم'} (${customerPhone || ''})`,
        subtitle: `💰 ${totalPrice || 0} EGP ── ${inlineItems}`,
      }
    },
  },
}
