export const FOOD_FACTS = [
  'Over 700 million people worldwide face hunger each year.',
  'Food insecurity is about access, affordability, and stability, not just food quantity.',
  'Reducing waste and improving food systems helps communities become more resilient.',
  'Community kitchens and aid programs help bridge urgent food access gaps.',
  'Zero Hunger is one of the UN Sustainable Development Goals and connects to health, education, and equality.',
]

export const BASE_INGREDIENTS = ['Rice', 'Beans', 'Veggies', 'Protein']
export const LEVEL_UNLOCKED_INGREDIENTS = [
  { name: 'Fruit', unlockLevel: 2 },
]

export const BASE_MEALS = [
  {
    id: 'rice-bowl',
    name: 'Rice Bowl',
    ingredients: { Rice: 1, Veggies: 1 },
    icon: '🍚',
    unlockLevel: 1,
  },
  {
    id: 'protein-plate',
    name: 'Protein Plate',
    ingredients: { Protein: 1, Rice: 1 },
    icon: '🍗',
    unlockLevel: 1,
  },
  {
    id: 'veggie-mix',
    name: 'Veggie Mix',
    ingredients: { Veggies: 2, Beans: 1 },
    icon: '🥗',
    unlockLevel: 1,
  },
  {
    id: 'bean-stew',
    name: 'Bean Stew',
    ingredients: { Beans: 2, Veggies: 1 },
    icon: '🥘',
    unlockLevel: 1,
  },
]

export const LEVEL_UP_MEALS = [
  {
    id: 'fruit-salad',
    name: 'Fruit Salad',
    ingredients: { Fruit: 1, Veggies: 1 },
    icon: '🥣',
    unlockLevel: 2,
  },
]

export function getAvailableIngredients(level) {
  const base = [...BASE_INGREDIENTS]
  const extras = LEVEL_UNLOCKED_INGREDIENTS.filter((item) => level >= item.unlockLevel).map((item) => item.name)
  return [...base, ...extras]
}

export function getAvailableMeals(level) {
  const allMeals = [...BASE_MEALS, ...LEVEL_UP_MEALS]
  return allMeals.filter((meal) => level >= meal.unlockLevel)
}

export function randomMeal(level) {
  const available = getAvailableMeals(level)
  if (!available.length) {
    return BASE_MEALS[0]
  }
  return available[Math.floor(Math.random() * available.length)]
}
