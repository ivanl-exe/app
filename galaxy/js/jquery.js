jQuery.fn.extend({
    tag: function(tag = null) {
        if(tag === null) { return this.prop("tagName").toLowerCase(); }
        this.prop("tagName", tag);
    },
    value: function(f = null) {
        const value = this.val();
        if(f == null) { return value; }
        return f(value);
    }
})