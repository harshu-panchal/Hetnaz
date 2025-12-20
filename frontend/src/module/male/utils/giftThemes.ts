import type { Gift } from '../types/male.types';

export interface GiftTheme {
  primary: string; // Main color
  secondary: string; // Secondary/light color
  dark: string; // Dark mode variant
  iconColor: string; // Icon color
}

export const getGiftTheme = (gift: Gift): GiftTheme => {
  const name = (gift?.name || '').toLowerCase();

  // Rose - Pink
  if (name.includes('rose')) {
    return {
      primary: 'from-pink-500 to-pink-600',
      secondary: 'from-pink-400 to-pink-500',
      dark: 'from-pink-600 to-pink-700',
      iconColor: 'text-pink-500 dark:text-pink-400',
    };
  }

  // Chocolate - Brown/Chocolate
  if (name.includes('chocolate')) {
    return {
      primary: 'from-amber-700 to-amber-800',
      secondary: 'from-amber-600 to-amber-700',
      dark: 'from-amber-800 to-amber-900',
      iconColor: 'text-amber-700 dark:text-amber-500',
    };
  }

  // Diamond - Blue/Cyan
  if (name.includes('diamond')) {
    return {
      primary: 'from-cyan-400 to-blue-500',
      secondary: 'from-cyan-300 to-blue-400',
      dark: 'from-cyan-500 to-blue-600',
      iconColor: 'text-cyan-400 dark:text-cyan-300',
    };
  }

  // Heart - Red/Pink
  if (name.includes('heart')) {
    return {
      primary: 'from-red-500 to-pink-500',
      secondary: 'from-red-400 to-pink-400',
      dark: 'from-red-600 to-pink-600',
      iconColor: 'text-red-500 dark:text-red-400',
    };
  }

  // Star - Yellow/Gold
  if (name.includes('star')) {
    return {
      primary: 'from-yellow-400 to-yellow-500',
      secondary: 'from-yellow-300 to-yellow-400',
      dark: 'from-yellow-500 to-yellow-600',
      iconColor: 'text-yellow-400 dark:text-yellow-300',
    };
  }

  // Crown - Gold/Yellow
  if (name.includes('crown')) {
    return {
      primary: 'from-yellow-500 to-amber-500',
      secondary: 'from-yellow-400 to-amber-400',
      dark: 'from-yellow-600 to-amber-600',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
    };
  }

  // Balloon - Colorful/Rainbow
  if (name.includes('balloon')) {
    return {
      primary: 'from-purple-400 via-pink-400 to-red-400',
      secondary: 'from-purple-300 via-pink-300 to-red-300',
      dark: 'from-purple-500 via-pink-500 to-red-500',
      iconColor: 'text-purple-500 dark:text-purple-400',
    };
  }

  // Ring - Silver/Gray
  if (name.includes('ring')) {
    return {
      primary: 'from-gray-400 to-gray-500',
      secondary: 'from-gray-300 to-gray-400',
      dark: 'from-gray-500 to-gray-600',
      iconColor: 'text-gray-400 dark:text-gray-300',
    };
  }

  // Default - Pink (for unknown gifts)
  return {
    primary: 'from-pink-500 to-pink-600',
    secondary: 'from-pink-400 to-pink-500',
    dark: 'from-pink-600 to-pink-700',
    iconColor: 'text-pink-500 dark:text-pink-400',
  };
};

export const getGiftImage = (giftName: string): string => {
  const name = (giftName || '').toLowerCase();

  // Icons8 Color icons (free for use with link, stable for demos)
  const baseUrl = 'https://img.icons8.com/fluency/96';

  if (name.includes('rose')) return `${baseUrl}/rose.png`;
  if (name.includes('chocolate')) return `${baseUrl}/chocolate-bar.png`;
  if (name.includes('diamond')) return `${baseUrl}/diamond.png`;
  if (name.includes('heart')) return `${baseUrl}/heart-with-arrow.png`;
  if (name.includes('star')) return `${baseUrl}/star.png`;
  if (name.includes('crown')) return `${baseUrl}/crown.png`;
  if (name.includes('balloon')) return `${baseUrl}/air-balloon.png`;
  if (name.includes('ring')) return `${baseUrl}/diamond-ring.png`;
  if (name.includes('teddy')) return `${baseUrl}/teddy-bear.png`;
  if (name.includes('cake')) return `${baseUrl}/birthday-cake.png`;
  if (name.includes('flower')) return `${baseUrl}/flower.png`;
  if (name.includes('coffee')) return `${baseUrl}/coffee.png`;

  // Default
  return `${baseUrl}/gift.png`;
};
