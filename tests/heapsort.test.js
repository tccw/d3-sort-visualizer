const { TestScheduler } = require("jest");
const heapsort = require("../heapsort");

let input      = [4,3,2,1,5,6];
const expected = [1,2,3,4,5,6];

test("Heap sort", () => {
    let heap = heapsort(input);
    console.log(heap);
    expect(heap).toEqual(expected);
});