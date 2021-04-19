class Stack {
    constructor() {
        this.stack = [];
    }

    length() {
        return this.stack.length;
    }

    push(item) {
        this.stack.push(item);
    }

    pop() {
        if (this.stack.length == 0) {
            return null;
        } else {
            return this.stack.pop();
        }
    }

    isEmpty() {
        return this.stack.length == 0;
    }
}

class Queue {
    constructor() {
        this.queue = [];
    }

    length() {
        return this.queue.length;
    }

    push(item) {
        this.queue.push(item);
    }

    pop() {
        if (this.queue.length == 0) {
            return null;
        } else {
            return this.queue.shift();
        }
    }

    isEmpty() {
        return this.queue.length == 0;
    }
}


exports.Stack = Stack;
exports.Queue = Queue;