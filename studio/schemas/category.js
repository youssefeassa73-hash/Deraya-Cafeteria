export default {
  name: 'category',
  title: 'قسم (Category)',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'اسم القسم (Category Name)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'ترتيب القسم (Order - 1, 2, 3...)',
      type: 'number',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'order',
    },
    prepare({title, subtitle}) {
      return {
        title: title,
        subtitle: subtitle ? `ترتيب: ${subtitle}` : '',
      }
    },
  },
}
