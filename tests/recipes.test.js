'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Recipes = require('../js/recipes.js');

const { BASE_ELEMENTS, RECIPES, EMOJI, emojiFor, combine, allElements } = Recipes;

test('combine works regardless of argument order', () => {
  assert.equal(combine('Fire', 'Water'), 'Steam');
  assert.equal(combine('Water', 'Fire'), 'Steam');
});

test('an element can be combined with itself', () => {
  assert.equal(combine('Water', 'Water'), 'Sea');
  assert.equal(combine('Earth', 'Earth'), 'Mountain');
});

test('pairs with no recipe return null', () => {
  assert.equal(combine('Fire', 'Fire'), null);
  assert.equal(combine('Human', 'Sun'), null);
});

test('no two recipes share the same ingredients', () => {
  const keys = RECIPES.map(([a, b]) => [a, b].sort().join('+'));
  assert.equal(new Set(keys).size, keys.length);
});

test('every element is reachable from the base elements', () => {
  const known = new Set(BASE_ELEMENTS);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [a, b, result] of RECIPES) {
      if (known.has(a) && known.has(b) && !known.has(result)) {
        known.add(result);
        changed = true;
      }
    }
  }
  for (const name of allElements()) {
    assert.ok(known.has(name), `${name} cannot be created from the base elements`);
  }
});

test('allElements includes base elements and every recipe result', () => {
  const all = new Set(allElements());
  for (const base of BASE_ELEMENTS) assert.ok(all.has(base));
  for (const [, , result] of RECIPES) assert.ok(all.has(result));
});

test('the game has exactly 100 elements', () => {
  assert.equal(allElements().length, 100);
});

test('every element has its own emoji', () => {
  for (const name of allElements()) {
    assert.notEqual(EMOJI[name], undefined, `${name} has no emoji`);
    assert.notEqual(emojiFor(name), '❔', `${name} fell back to the default emoji`);
  }
});

test('emoji entries match element names exactly', () => {
  assert.deepEqual(Object.keys(EMOJI).sort(), [...allElements()].sort());
});

test('no two elements share an emoji', () => {
  const emojis = Object.values(EMOJI);
  assert.equal(new Set(emojis).size, emojis.length);
});

test('no recipe uses an element that does not exist', () => {
  const names = new Set(allElements());
  for (const [a, b, result] of RECIPES) {
    assert.ok(names.has(a) && names.has(b) && names.has(result), `${a}+${b}=${result}`);
  }
});

