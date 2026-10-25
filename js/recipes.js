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
    ['Cloud', 'Mountain', 'Snow'],
    ['Snow', 'Water', 'Ice'],
    ['Mountain', 'Water', 'Waterfall'],
    ['River', 'Earth', 'Lake'],
    ['Cloud', 'Rain', 'Storm'],
    ['Storm', 'Energy', 'Lightning'],
    ['Air', 'Sun', 'Wind'],
    ['Air', 'Cloud', 'Sky'],
    ['Sky', 'Stone', 'Moon'],
    ['Sun', 'Sky', 'Star'],
    ['Star', 'Earth', 'Planet'],
    ['Fire', 'Wood', 'Ash'],
    ['Ash', 'Air', 'Smoke'],
    ['Wood', 'Earth', 'Coal'],
    ['Coal', 'Mountain', 'Diamond'],
    ['Metal', 'Sun', 'Gold'],
    ['Metal', 'Moon', 'Silver'],
    ['Metal', 'Earth', 'Iron'],
    ['Iron', 'Fire', 'Steel'],
    ['Metal', 'Clay', 'Bronze'],
    ['Metal', 'Tool', 'Sword'],
    ['Stone', 'Tool', 'Wheel'],
    ['Metal', 'Energy', 'Engine'],
    ['Engine', 'Wheel', 'Car'],
    ['Engine', 'Human', 'Robot'],
    ['Robot', 'Glass', 'Computer'],
    ['Computer', 'Human', 'Phone'],
    ['Plant', 'Sun', 'Flower'],
    ['Plant', 'Dust', 'Seed'],
    ['Tree', 'Sun', 'Fruit'],
    ['Fruit', 'Water', 'Juice'],
    ['Fruit', 'Earth', 'Apple'],
    ['Tree', 'Tree', 'Forest'],
    ['Forest', 'Rain', 'Mushroom'],
    ['Plant', 'Water', 'Grass'],
    ['Life', 'Energy', 'Animal'],
    ['Animal', 'Water', 'Fish'],
    ['Animal', 'Air', 'Bird'],
    ['Bird', 'Earth', 'Egg'],
    ['Egg', 'Lava', 'Dinosaur'],
    ['Dinosaur', 'Fire', 'Dragon'],
    ['Human', 'Sword', 'Hero'],
    ['Brick', 'Wood', 'House'],
    ['House', 'Human', 'City'],
    ['Brick', 'Stone', 'Castle'],
    ['River', 'Wood', 'Bridge'],
    ['Wood', 'Water', 'Boat'],
    ['Boat', 'Metal', 'Ship'],
    ['Engine', 'Fire', 'Rocket'],
    ['Sea', 'Sun', 'Salt'],
    ['Tree', 'Tool', 'Paper'],
    ['Paper', 'Human', 'Book'],
    ['Glass', 'Energy', 'Light'],
    ['Light', 'Metal', 'Lamp'],
    ['Energy', 'Human', 'Magic'],
    ['Magic', 'Human', 'Wizard'],
    ['Glass', 'Mountain', 'Crystal'],
    ['Metal', 'Lava', 'Bomb'],
    ['Bomb', 'Fire', 'Explosion'],
    ['Lava', 'Mountain', 'Volcano'],
    ['Sand', 'Sun', 'Desert'],
    ['Desert', 'Water', 'Oasis'],
    ['Sand', 'Sea', 'Beach'],
    ['Sea', 'Mountain', 'Island'],
    ['Mud', 'Plant', 'Swamp'],
    ['Sea', 'River', 'Ocean'],
    ['Sea', 'Stone', 'Pearl'],
    ['Rain', 'Sun', 'Rainbow'],
    ['Storm', 'Wind', 'Tornado'],
    ['Desert', 'Plant', 'Cactus'],
    ['Ash', 'Fire', 'Campfire'],
    ['Fish', 'Fire', 'Food'],
    ['Cloud', 'Sea', 'Fog'],
  ];

  // Emoji shown on each element's tile. Keys must match element names exactly.
  const EMOJI = {
    Water: '💧', Fire: '🔥', Earth: '🌍', Air: '💨',
    Steam: '♨️', Mud: '🟤', Rain: '🌧️', Lava: '🟠',
    Energy: '⚡', Dust: '✨', Mountain: '⛰️', Sea: '🌊',
    Cloud: '☁️', Plant: '🌱', Brick: '🧱', Stone: '🪨',
    Metal: '🔩', Sand: '🟡', Glass: '🪟', Clay: '🏺',
    Life: '🧬', Human: '🧑', Tree: '🌳', Wood: '🪵',
    Sun: '☀️', Tool: '🛠️', River: '🏞️', Snow: '❄️',
    Ice: '🧊', Waterfall: '💦', Lake: '🦆', Storm: '⛈️',
    Lightning: '🌩️', Wind: '🌬️', Sky: '🌤️', Moon: '🌙',
    Star: '⭐', Planet: '🪐', Ash: '⚫', Smoke: '🚬',
    Coal: '⬛', Diamond: '💎', Gold: '🪙', Silver: '⚪',
    Iron: '🧲', Steel: '🔗', Bronze: '🥉', Sword: '🗡️',
    Wheel: '🛞', Engine: '⚙️', Car: '🚗', Robot: '🤖',
    Computer: '💻', Phone: '📱', Flower: '🌸', Seed: '🌰',
    Fruit: '🍇', Juice: '🧃', Apple: '🍎', Forest: '🌲',
    Mushroom: '🍄', Grass: '🌿', Animal: '🐾', Fish: '🐟',
    Bird: '🐦', Egg: '🥚', Dinosaur: '🦖', Dragon: '🐉',
    Hero: '🦸', House: '🏠', City: '🏙️', Castle: '🏰',
    Bridge: '🌉', Boat: '⛵', Ship: '🚢', Rocket: '🚀',
    Salt: '🧂', Paper: '📄', Book: '📖', Light: '💡',
    Lamp: '🪔', Magic: '🪄', Wizard: '🧙', Crystal: '🔮',
    Bomb: '💣', Explosion: '💥', Volcano: '🌋', Desert: '🏜️',
    Oasis: '🌴', Beach: '🏖️', Island: '🏝️', Swamp: '🐸',
    Ocean: '🐳', Pearl: '🦪', Rainbow: '🌈', Tornado: '🌪️',
    Cactus: '🌵', Campfire: '🏕️', Food: '🍲', Fog: '🌁',
  };

  const FALLBACK_EMOJI = '❔';

  function emojiFor(name) {
    return EMOJI[name] || FALLBACK_EMOJI;
  }

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

  const api = { BASE_ELEMENTS, RECIPES, EMOJI, emojiFor, combine, allElements, keyFor };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Recipes = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
