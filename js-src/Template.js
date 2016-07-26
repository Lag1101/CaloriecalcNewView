/**
 * Created by LuckyBug on 23.07.2016.
 */

module.exports = (function(){
    function Template(id) {
        this.el = $(id);
    }

    Template.prototype.clone = function() {
        return this.el.children().clone();
    };
    return Template;
})();
