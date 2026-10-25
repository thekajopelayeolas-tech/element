(function (root) {
  'use strict';

  // Elements every player starts with.
  const BASE_ELEMENTS = ['Water', 'Fire', 'Earth', 'Air'];

  // Each entry is [ingredientA, ingredientB, result]. Order does not matter.
  const RECIPES = [
    ['Water', 'Fire', 'Steam'],
    ['Water', 'Earth', 'Mud'],
    ['Water', 'Air', 'Rain'],
    ['Fire', 'Earth', 'Lava'],
    ['Fire', 'Air', 'Energy'],
    ['Earth', 'Air', 'Dust'],
    ['Earth', 'Earth', 'Mountain'],
    ['Water', 'Water', 'Sea'],
    ['Steam', 'Air', 'Cloud'],
    ['Rain', 'Earth', 'Plant'],
    ['Mud', 'Fire', 'Brick'],
    ['Lava', 'Air', 'Stone'],
    ['Stone', 'Fire', 'Metal'],
    ['Stone', 'Water', 'Sand'],
    ['Sand', 'Fire', 'Glass'],
    ['Dust', 'Water', 'Clay'],
    ['Plant', 'Energy', 'Life'],
    ['Life', 'Clay', 'Human'],
    ['Plant', 'Earth', 'Tree'],
    ['Tree', 'Fire', 'Wood'],
    ['Energy', 'Cloud', 'Sun'],
    ['Metal', 'Wood', 'Tool'],
    ['Mountain', 'Rain', 'River'],
  ];

  function keyFor(a, b) {
    return [a, b].sort().join('+');
  }

  const recipeMap = new Map();
  for (const [a, b, result] of RECIPES) {
    const key = keyFor(a, b);
    if (recipeMap.has(key)) {
      throw new Error(`Duplicate recipe for ${key}`);
    }
    recipeMap.set(key, result);
  }

  // Returns the resulting element name, or null if the pair makes nothing.
  function combine(a, b) {
    return recipeMap.get(keyFor(a, b)) ?? null;
  }

  // Every element that appears in the game, base elements included.
  function allElements() {
    const names = new Set(BASE_ELEMENTS);
    for (const [a, b, result] of RECIPES) {
      names.add(a);
      names.add(b);
      names.add(result);
    }
    return [...names];
  }

  const api = { BASE_ELEMENTS, RECIPES, combine, allElements, keyFor };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Recipes = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
