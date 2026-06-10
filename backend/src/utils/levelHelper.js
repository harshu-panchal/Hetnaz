/**
 * Helper to calculate male user levels based on settings thresholds
 */

export const calculateUserLevel = (totalCoinsSpent = 0, maleLevels = []) => {
  if (!maleLevels || maleLevels.length === 0) {
    // Standard Fallback configurations
    maleLevels = [
      { level: 1, minCoinsSpent: 0, badgeName: 'Novice' },
      { level: 2, minCoinsSpent: 1000, badgeName: 'Explorer' },
      { level: 3, minCoinsSpent: 3000, badgeName: 'Chaser' },
      { level: 4, minCoinsSpent: 6000, badgeName: 'Vanguard' },
      { level: 5, minCoinsSpent: 10000, badgeName: 'Elite' },
      { level: 6, minCoinsSpent: 20000, badgeName: 'Titan' }
    ];
  }

  // Sort levels in ascending order
  const sortedLevels = [...maleLevels].sort((a, b) => a.minCoinsSpent - b.minCoinsSpent);

  let currentLevelObj = sortedLevels[0] || { level: 1, minCoinsSpent: 0, badgeName: 'Novice' };
  let nextLevelObj = null;

  for (let i = 0; i < sortedLevels.length; i++) {
    if (totalCoinsSpent >= sortedLevels[i].minCoinsSpent) {
      currentLevelObj = sortedLevels[i];
      nextLevelObj = sortedLevels[i + 1] || null;
    } else {
      break;
    }
  }

  const currentLevel = currentLevelObj.level;
  const currentBadge = currentLevelObj.badgeName;
  const minSpentForCurrent = currentLevelObj.minCoinsSpent;

  let nextLevelThreshold = null;
  let progressPercent = 100;
  let coinsNeeded = 0;

  if (nextLevelObj) {
    nextLevelThreshold = nextLevelObj.minCoinsSpent;
    coinsNeeded = nextLevelThreshold - totalCoinsSpent;
    const levelRange = nextLevelThreshold - minSpentForCurrent;
    const spentInCurrentRange = totalCoinsSpent - minSpentForCurrent;
    progressPercent = levelRange > 0 ? Math.min(Math.max(Math.floor((spentInCurrentRange / levelRange) * 100), 0), 100) : 100;
  } else {
    // Maximum level reached
    nextLevelThreshold = null;
    progressPercent = 100;
    coinsNeeded = 0;
  }

  return {
    level: currentLevel,
    badgeName: currentBadge,
    totalCoinsSpent,
    nextLevelThreshold,
    progressPercent,
    coinsNeeded,
    nextLevel: nextLevelObj ? nextLevelObj.level : null
  };
};

export default {
  calculateUserLevel
};
