

function RawProduct(p, onChange){

    p = p || {};
    p.items = p.items || {};

    if (!p.id)
        throw new Error("id not specified");

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

    this._onChange = onChange;
}

RawProduct.prototype.linkToDOM = function(d) {
    this.root =    d;

    this.itemsNames.forEach(function(name){
        this.el[name] = d.find("." + name);
        this.el[name].val(this.items[name]);
        this.el[name].on("change",this.onChange.bind(this, name));
    }.bind(this));

    return this;
};

RawProduct.prototype.onChange = function(name) {
    this.items[name] = this.el[name].val();
    this._onChange && this._onChange(this);
};

RawProduct.prototype.getItems = function() {
    return this.items;
};