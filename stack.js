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
            return this.stack.shift();
        }
    }
}

exports.Stack = Stack;