

function RawProduct(id, p, onChange){

    if (!id)
        throw new Error("id not specified");

    this.id = id;

    this.el = {};

    p = p || {};
    this.items = {
        description:    p.description || "",
        proteins:       p.proteins || 0,
        triglyceride:   p.triglyceride || 0,
        carbohydrate:   p.carbohydrate || 0,
        calories:       p.calories || 0
    };
    this.itemsNames = Object.keys(this.items);

    this._onChange = onChange;
}

RawProduct.prototype.linkToDOM = function(d) {
    this.root =    d;

    this.itemsNames.forEach(function(name){
        this.el[name] = d.find("." + name);
        this.el[name].val(this.items[name]);
        this.el[name].on("input",this.onChange.bind(this, name));
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