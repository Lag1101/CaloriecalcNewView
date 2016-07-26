

module.exports = (function(){
    function RawProduct(p, params){

        p = p || {};
        p.items = p.items || {};

        if (!p.id)
            this.state = "sync";
        else
            this.state = "ready";

        this.id = p.id;

        this.el = {};

        this.items = {
            description:    p.items.description || "",
            proteins:       p.items.proteins || 0,
            triglyceride:   p.items.triglyceride || 0,
            carbohydrate:   p.items.carbohydrate || 0,
            calories:       p.items.calories || 0
        };
        this.itemsNames = Object.keys(this.items);

        this.params = params || {};

    }

    RawProduct.prototype.linkToDOM = function(d) {
        this.root =    d;
        this.applyState("ready");

        this.itemsNames.forEach(function(name){
            this.el[name] = d.find("." + name);
            this.el[name].val(this.items[name]);
            this.el[name].on("change",this.onChange.bind(this, name));
        }.bind(this));

        return this;
    };

    RawProduct.prototype.onChange = function(name) {
        this.items[name] = this.el[name].val();
        this.params.onChange && this.params.onChange(this);
    };

    RawProduct.prototype.getItems = function() {
        return this.items;
    };

    RawProduct.StateClass = {
        sync: "sync-state",
        ready: "ready-state",
        error: "error-state"
    };

    RawProduct.prototype.applyState = function(state) {
        if(!state || state === this.state || Object.keys(RawProduct.StateClass).indexOf(state) < 0 )
            return;

        this.root && this.root.removeClass(RawProduct.StateClass[this.state]);
        this.root && this.root.addClass(RawProduct.StateClass[state]);

        this.setState(state);
    };

    RawProduct.prototype.setState = function(state) {
        this.state = state;
    };

    RawProduct.prototype.setId = function(id) {
        this.id = id;
    };

    RawProduct.prototype.getId = function() {
        return this.id;
    };

    RawProduct.prototype.getEl = function() {
        return this.root;
    };

    return RawProduct;
})();
