export default {
  name: 'offer',
  title: 'Special Offer',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'عنوان العرض (Offer Title)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'تفاصيل العرض (Offer Details)',
      type: 'text',
      rows: 2,
    },
    {
      name: 'price',
      title: 'سعر العرض (Offer Price - EGP)',
      type: 'number',
    },
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
    },
    prepare({title, price}) {
      return {
        title: title,
        subtitle: price ? `${price} EGP` : 'No price',
      }
    },
  },
}
