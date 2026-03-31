const images = [
  'default',
  'car',
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

export default function preloadImages() {
  images.forEach((category) => {
    const img = new Image();
    img.src = `/images/icon/${category}.svg`;
  });
}
