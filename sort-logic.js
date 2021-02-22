// General constants
const WIDTH = 105;
const HEIGHT = 105;
const sortAlgs = ["quicksort", "bubblesort", ""]

/**
 * Create a global array of size n and fill it with values 0..n
 */
const n = 20;
var arr = Array.from({length: n}, (_, i) => (i + 1) * (Math.floor(WIDTH / n)));

/**
 * "Fisher-Yates" shuffle operating on the 
 * global variable arr
 */
async function shuffleArray() {
    allSameColor("grey");
    var indexes = Array.from(Array(n).keys());
    let i;
    for(let j = 0; j < arr.length; j++) {
        i = Math.floor((Math.random() * j))
        swap(i, j);
    }
    await updateBars(0);    
}


/**
 * Setting up the SVG container which will be used to 
 * draw the bars in. 
 */
const barWidth = 3;
const scale = 1;

var y_scale = d3.scaleLinear()
            .domain([0, n-1])
            .range([0, HEIGHT - barWidth]);

const svgContainer = d3.select("body")
                       .append("svg")
                       .attr("width", WIDTH)
                       .attr("height", HEIGHT);

var bars = svgContainer.selectAll("rect")
                        .data(arr)
                        .enter()
                        .append("rect");

var barAttributes = bars.attr("x", 2)
                        .attr("y", function(d, i) { return y_scale(i); })
                        .attr("width",  function(d) { return d * scale; })
                        .attr("height", barWidth)
                        .attr("id", function(d,i) {return "elem_" + i; })
                        .attr("fill", "grey");

/**
 * https://stackoverflow.com/questions/21455559/d3-sorting-of-an-array-of-objects
 * The rects need to have a name that will change when the array is updated otherwise
 * they will not change positon. This can be done by settings the name to the value.
 */
async function updateBars(timeout) {
    svgContainer
        .selectAll("rect")
        .data(arr, function(d) {return d})
        .attr("y", function(d, i) { return y_scale(i); })
    if (typeof timeout !== 'undefined') {
        await sleep(timeout);
    } else {
        await sleep();
    }
}

function trackerArrowId(id, color, i) {
    /** Adding 1 to index since d3 scales use 1-based indexing*/
    let y = y_scale(i+1) - (barWidth * 1.3)
    let tracker = svgContainer.select(`#${id}`);

    /** If the tracker doesn't exist yet, make it */
    if (tracker.empty()) {
        svgContainer.append("polygon")
                .attr("id", id)
                .attr("points", `5,${y} 0,${y + barWidth} 0,${y - barWidth}`)
                .attr("fill", color);
    } else {
        /** Otherwise simply update the position */
        tracker.attr("points", `5,${y} 0,${y + barWidth} 0,${y - barWidth}`);
    }
}

function clearPoylgons() {
    svgContainer.selectAll("polygon").remove();
}

function allSameColor(color) {
    svgContainer.selectAll("rect").attr("fill", color);
}


/**
 * ----------------------------------------------------------------
 * All sort implementations and helper functions
 * ----------------------------------------------------------------
 */

// Helper delay function to allow clean transitions
function sleep(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
    
function swap(i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]]; // ES6 style
}

/** Quicksort implementation */
function quicksort() {
    /** Recursive call with callback to update chart and remove tracker markers (polygons) */
    quicksortRecur(0, arr.length - 1, () => {
        updateBars(0);
        clearPoylgons();
    })    
}

/**
 * End value pivot implementation of quicksort 
 * @global {array to sort} arr  
 * @param {the first index of the array i.e. 0} lo 
 * @param {last index of the array i.e. (list.length - 1)} hi 
 */
async function quicksortRecur(lo, hi, callback) {
    trackerArrowId("pivot_arrow", "green", hi);
    /** Only sort if lo index < hi index, i.e. if we haven't looked through the entire list yet */
    if (lo < hi) {
        let p = await qsortPartition(lo, hi);
        await quicksortRecur(lo, p - 1, callback);
        await quicksortRecur(p + 1, hi, callback);
    } else {
        callback();
    }
}
    
/**
 * A partition helper to order the array around the pivot
 * @global {array to sort} arr 
 * @param {the lowest index of the subarray} lo 
 * @param {the highest index of the subarry} hi 
 */
async function qsortPartition(lo, hi) {
    let pivot = arr[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) {
        trackerArrowId("blue_arrow", "blue", j);
        if (arr[j] < pivot) {
            swap(i, j);
            i++;
            trackerArrowId("red_arrow", "red", i);
        }
        await updateBars();
    }
    swap(i, hi);
    return i;
}
    
/**
 * Bubble sort implementation
 * @global {array to sort} arr  
 */
async function bubblesort() {
    let len = arr.length;

    /** For each element in the array */
    for (let i = 0; i < len; i++) {

        /** Initialize a flag to track whether we swapped during this iteration */
        let swapped = false;

        /** 
         * Compare the last elem of the list with the element above it (lower idx).
         * If the current element is smaller, "bubble" the current elem up one level 
         * by swapping their positions.  
         */
        for (let j = len; j > i; j--) {
            if (arr[j] < arr[j-1]) {
                swap(j, j-1);
                swapped = true;
                trackerArrowId("bubble_arrow", "red", j-1);
            } 
            /** Sleep every iteration for timing comparison */
            await updateBars();
        }
        /** 
         * If swapped is still false, then every element is in its correct location 
         * and the list is sorted, so breakout.
         */
        if (! swapped) { break; }
    }
    clearPoylgons();
}

/**
 * Insertion sort implementation
 */
async function insertionsort() {
    for (let i = 1; i < arr.length; i++) {
        let j = i;
        while (j > 0 && arr[j - 1] > arr[j]) {
            swap(j, j-1);
            trackerArrowId("red_arrow", "red", j-1)
            await updateBars();
            j--;
        }
        await sleep();
    }

    clearPoylgons();
}


/**
 * Selection sort implementation
 */
async function selectionsort() {
    let min_idx;

    /** For each element in the array */
    for (let i = 0; i < arr.length; i++) {
        /** Set the current min to the beginning the subarray */
        min_idx = i;
        trackerArrowId("elem_to_swap", "orange", i);
        /** Find the minimum element in the array A[i .. n] */
        for (j = i; j < arr.length; j++) {
            if (arr[j] < arr[min_idx]) { 
                min_idx = j;
                trackerArrowId("current_min", "green", min_idx);
            }
            trackerArrowId("current_item", "red", j)
            /** Sleep every iteration for timing comparison */
            await sleep();
        }

        /** Swap elements only if the start of the current  subarray isn't also the min elem */
        if (min_idx != i) {
            swap(i,min_idx);
            await updateBars();
        } 
    }
    clearPoylgons();
}

/** Heap sort implementation  --------------------------------------------- */
var size;

/** Heap sort implementation */
async function heapsort() {
    size = arr.length;
    /** Reorder the array such that it represents a heap*/
    await buildHeap();
    console.log(arr);

    /** Swap the first and last elements, heapify down, and repeat until sorted */
    while (size > 0) {
        await heapSwap();
    }
    clearPoylgons();
}

async function buildHeap() {
    /** Star building the heap by looking at smallest, final subtree */
    for (let i = parent(size - 1); i >= 0; i-- ) {
        heapifyDown(i);
        trackerArrowId("heap_tracker", "red", i);
        await updateBars();
    }
}

function heapifyDown(i) {
    if (hasAChild(i)) {
        let maxChildIndex = maxChild(i);
        if (arr[i] < arr[maxChildIndex]) {
            swap(i, maxChildIndex);
            heapifyDown(maxChildIndex);
        }
    }
}

function hasAChild(i) {
    /** If the left child index is out of bounds, the right child will be too, so the elem has no children */
    return leftChild(i) < size;
}

/**
 * INVARIANT: node position passed will always have at least one child
 * @param {index position of parent in the heap} i 
 */
function maxChild(i) {
    let left = leftChild(i);
    let right = rightChild(i);
    if (left < size && right < size) {
        return (arr[left] > arr[right]) ? left : right;
    } else {
        return (left < size) ? left : right; 
    }
}

/** Similar to a maxPop function.
 * Swapping the first and last element puts the max valued at the end
 * of the array. Decrement size and heapify the remaining sublist. 
 */
async function heapSwap() {
    /** Swap the first element with the last elem */
    swap(0, size-1);
    await updateBars();
    size--;
    trackerArrowId("heap_tracker", "red", 0);
    await sleep(50);
    trackerArrowId("heap_tracker", "red", size);

    /** Heapify down from the root of the new subarray */
    heapifyDown(0);
}

function parent(i) {
    /** 
     * Recall that left child of a node is (2 * i) + 1
     * and the right child is (2 * i) + 2 for 1-based heap
     */
    
    return (i - 1) / 2;
}

function leftChild(i) {
    return (i * 2) + 1;
}

function rightChild(i) {
    return (i * 2) + 2;
}

/** End heap sort --------------------------------------------- */
