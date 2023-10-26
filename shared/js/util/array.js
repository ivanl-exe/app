Array.prototype.sum = function() {
    c = 0;
    for(let i = 0; i < this.length; i++) {
        c += this[i];
    }
    return c;
}
