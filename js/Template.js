/**
 * Created by LuckyBug on 23.07.2016.
 */


function Template(id) {
    this.el = $(id);
}

Template.prototype.clone = function() {
    return this.el.children().clone();
};