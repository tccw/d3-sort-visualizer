// General constants
const WIDTH = 105;
const HEIGHT = 105;
const sortAlgs = ["quicksort", "bubblesort", ""]

/**
 * Create a global array of size n and fill it with values 0..n
 */
const n = 20;
var arr = Array.from({length: n}, (_, i) => (i + 1) * 5);

/**
 * "Fisher-Yates" shuffle operating on the 
 * global variable arr
 */
function shuffleArray() {
    allSameColor("grey");
    var indexes = Array.from(Array(n).keys());
    let i;
    for(let j = 0; j < arr.length; j++) {
        i = Math.floor((Math.random() * j))
        swap(i, j);
    }
    updateBars();    
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
function updateBars() {
    svgContainer
        .selectAll("rect")
        .data(arr, function(d) {return d})
        .attr("y", function(d, i) { return y_scale(i); })
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

function changeBarColor(color) {
    let prev = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > prev) {
            svgContainer.select(`${"#elem_" + i-1}`).attr("fill", color);
            prev = arr[i];
        } else {
            break;
        }
    }
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
        updateBars();
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
            updateBars();
        }
        await sleep();
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
                updateBars();
            } 
            /** Sleep every iteration for timing comparison */
            await sleep();
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
            updateBars();
            j--;
            await sleep();
        }
        await sleep();
        changeBarColor("black");
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
            updateBars();
            await sleep();
        } 
    }
    clearPoylgons();
}

/** Heap sort implementation */
function heapsort() {
    /** Reorder the array such that it represents a heap*/
    buildHeap();

    /** Min pop from the heap placing each popped element after the last popped, which sorts the list */

}

function buildHeap() {
    /** Star building the heap by looking at smallest, final subtree */
    for (let i = parent(arr.length - 1); i >= 0; i-- ) {
        heapifyDown(i);
    }
}

function heapifyDown(i) {
    if (hasAChild(i)) {
        let minChildIndex = minChild(i);
        console.log(minChildIndex);
        if (arr[i] < arr[minChildIndex]) {
            swap(i, minChildIndex);
            heapifyDown(minChildIndex);
        }
    }
}

function hasAChild(i) {
    /** If the left child index is out of bounds, the right child will be too, so the elem has no children */
    return leftChild(i) > arr.length;
}

function minChildIndex(i) {
    /** JS will return undefined if an array is indexed outside its boundary */
    let left = leftChild(i);
    let right = arr[rightChild(i)];
    if (typeof arr[left] !== 'undefined' && typeof arr[right] !== 'undefined') {
        return (arr[left] > arr[right]) ? left : right;
    } else {
        return (typeof arr[left] == 'undefined') ? right : left;
    }
}

function minPop() {
    
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