
//{
//    name: "description",
//    default: ""
//}
module.exports = (function(){
    function TemplateProduct(fields, p, params){

        p = p || {};
        p.items = p.items || {};

        if (!p.id)
            this.state = "sync";
        else
            this.state = "ready";

        this.id = p.id;

        this.el = {};

        this.items = {};
        fields.forEach(function(f){
            this.items[f.name] = p.items[f.name] || f.default;
        }.bind(this));

        this.itemsNames = Object.keys(this.items);

        this.params = params || {};

    }

    TemplateProduct.prototype.linkToDOM = function(d) {
        this.root =    d;
        this.applyState("ready");

        this.itemsNames.forEach(function(name){
            this.el[name] = d.find("." + name);
            this.el[name].val(this.items[name]);
            this.el[name].on("change",this.onChange.bind(this, name));
        }.bind(this));

        return this;
    };

    TemplateProduct.prototype.onChange = function(name) {
        this.items[name] = this.el[name].val();
        this.params.onChange && this.params.onChange(this);
    };

    TemplateProduct.prototype.getItems = function() {
        return this.items;
    };

    TemplateProduct.StateClass = {
        sync: "sync-state",
        ready: "ready-state",
        error: "error-state"
    };

    TemplateProduct.prototype.applyState = function(state) {
        if(!state || state === this.state || Object.keys(TemplateProduct.StateClass).indexOf(state) < 0 )
            return;

        this.root && this.root.removeClass(TemplateProduct.StateClass[this.state]);
        this.root && this.root.addClass(TemplateProduct.StateClass[state]);

        this.setState(state);
    };

    TemplateProduct.prototype.setState = function(state) {
        this.state = state;
    };

    TemplateProduct.prototype.setId = function(id) {
        this.id = id;
    };

    TemplateProduct.prototype.getId = function() {
        return this.id;
    };

    TemplateProduct.prototype.getEl = function() {
        return this.root;
    };

    return TemplateProduct;
})();
