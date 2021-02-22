
var arr;

function swap(i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]]; // ES6 style
}

/** Heap sort implementation */
function heapsort(input_arr) {
    arr = input_arr;
    /** Reorder the array such that it represents a heap*/
    buildHeap();

    /** Min pop from the heap placing each popped element after the last popped, which sorts the list */
    return arr;
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
    return leftChild(i) < arr.length;
}

function minChild(i) {
    /** JS will return undefined if an array is indexed outside its boundary */
    let left = leftChild(i);
    let right = rightChild(i);
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

module.exports = heapsort;
