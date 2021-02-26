const { TestScheduler } = require("jest");
const heapsort = require("../heapsort");

let input_1          = [4,3,2,1,5,6];
let input_2          = [35,75,85,30,20,5,45,40,25,65,80,50,60,55,100,15,70,95,90,10]
let max_heap_order   = []
const expected_1     = [1,2,3,4,5,6];
const expected_2     = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]
const expected_mheap = []




test("Heap sort simple", () => {
    expect(heapsort(input_1)).toEqual(expected_1);
});

test("Heap sort medium", () => {
    expect(heapsort(input_2)).toEqual(expected_2);
})