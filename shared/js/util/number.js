Number.prototype.count = function() {
    let modulus = this.toString().split('.');
    let remainder = modulus.length == 2 ? modulus.pop() : '';
    modulus = modulus[0];
    return [modulus, remainder].map((s) => s.length);
}

Number.prototype.modulo = function(divisor) {
    const exponent = Math.max(...[this, divisor].map((n) => n.count()[1]));
    const multiplier = Math.pow(10, exponent);
    return ((this * multiplier) % (divisor * multiplier)) / multiplier;
}

const parseNumber = (n) => {
    if(typeof n == "number") { return n; }
    if(typeof n == "string" && n != "" && n.isNumeric()) {
        return parseFloat(n);
    }
    return null;
}

const safeDivision = (dividend, divisor) => {
    if(divisor == 0) { return 0; }
    const ratio = dividend / divisor;
    return ratio;
}

const wrap = (n, [min, max]) => {
    if(n < min) { n = (min - 1) - n + (max - 1); }
    return (n - min) % (max - min) + min;
}