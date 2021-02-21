const sort = require('../sort-logic');

var expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

test('Bubble Sort', () => {
    expect(sort.bubblesort().toEqual(expected));
})