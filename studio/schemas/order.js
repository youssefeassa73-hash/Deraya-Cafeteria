export default {
  name: 'order',
  title: 'Orders (الطلبات)',
  type: 'document',
  fields: [
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
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'items',
      title: 'الأطباق المطلوبة (Ordered Items)',
      type: 'text',
      rows: 4,
    },
    {
      name: 'totalPrice',
      title: 'السعر الإجمالي (Total Price - EGP)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'status',
      title: 'حالة الطلب (Order Status)',
      type: 'string',
      options: {
        list: [
          {title: 'غير مؤكد (Not Confirmed)', value: 'not_confirmed'},
          {title: 'مدفوع (Paid)', value: 'paid'},
          {title: 'مكتمل (Done)', value: 'done'},
        ],
        layout: 'radio',
      },
      initialValue: 'not_confirmed',
      validation: (Rule) => Rule.required(),
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
      totalPrice: 'totalPrice',
      status: 'status',
    },
    prepare({orderNumber, customerName, totalPrice, status}) {
      const statusLabels = {
        not_confirmed: 'غير مؤكد ⚠️',
        paid: 'مدفوع 💰',
        done: 'مكتمل ✓',
      };
      return {
        title: `طلب #${orderNumber || '????'} — ${customerName || 'بدون اسم'}`,
        subtitle: `${totalPrice || 0} EGP — ${statusLabels[status] || status}`,
      }
    },
  },
}
