export const FOOD_FACTS = [
  'Over 700 million people worldwide face hunger each year.',
  'Food insecurity is about access, affordability, and stability, not just food quantity.',
  'Reducing waste and improving food systems helps communities become more resilient.',
  'Community kitchens and aid programs help bridge urgent food access gaps.',
  'Zero Hunger is one of the UN Sustainable Development Goals and connects to health, education, and equality.',
]

export const INGREDIENTS = ['Rice', 'Beans', 'Veggies', 'Protein']

export const MEALS = [
  {
    id: 'rice-bowl',
    name: 'Rice Bowl',
    ingredients: { Rice: 1, Veggies: 1 },
    icon: '🍚',
  },
  {
    id: 'protein-plate',
    name: 'Protein Plate',
    ingredients: { Protein: 1, Rice: 1 },
    icon: '🍗',
  },
  {
    id: 'veggie-mix',
    name: 'Veggie Mix',
    ingredients: { Veggies: 2, Beans: 1 },
    icon: '🥗',
  },
  {
    id: 'bean-stew',
    name: 'Bean Stew',
    ingredients: { Beans: 2, Veggies: 1 },
    icon: '🥘',
  },
]

export function randomMeal() {
  return MEALS[Math.floor(Math.random() * MEALS.length)]
}
