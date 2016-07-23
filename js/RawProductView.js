

function RawProduct(p){

    if (p.id !== undefined && p.id != null)
        this.id = p.id;
    else
        this.id = Math.random();


    this.el = {};
    this.items = {
        description:    p.description,
        proteins:       p.proteins | 0,
        triglyceride:   p.triglyceride | 0,
        carbohydrate:   p.carbohydrate | 0,
        calories:       p.calories | 0
    };
    this.itemsNames = Object.keys(this.items);
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
    console.log({
        id: this.id,
        items: this.items
    });
};

RawProduct.prototype.cloneWithoutId = function() {
    return new RawProduct(this.items);
};