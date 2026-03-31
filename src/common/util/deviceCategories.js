export const deviceCategories = [
  'default',
  'car',
  'suv',
  'truck',
  'motorcycle',
  'bicycle',
  'bus',
  'train',
  'boat',
  'ship',
  'plane',
  'helicopter',
  'person',
  'animal',
  'scooter',
  'van',
  'camper',
  'tractor',
  'crane',
  'trailer',
];

export const getCategoryIcon = (category) => {
  return `/images/icon/${category || 'default'}.svg`;
};
