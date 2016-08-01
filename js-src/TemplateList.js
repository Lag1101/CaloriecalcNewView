/**
 * Created by luckybug on 27.07.16.
 */

module.exports = (function(){

    const ErrorWrapper = require("./ErrorWrapper");

    function ListTemplate(params) {

        this.params = params || {};
        this.collection = this.params.collection;
        this.template = this.params.template;
        this.listEl = this.params.listEl;
        this.TemplateProduct = this.params.TemplateProduct;

        this.products = {};

        this.collection.getValue(function(err, res) {
            if(err) {
                ErrorWrapper(err);
            } else {
                this.onGet(res);
            }
        }.bind(this));

    }

    ListTemplate.prototype.onGet = function(componentsRes){
        var components = componentsRes ? Object.keys(componentsRes).map(function(id){
            return this.addToList(id, componentsRes[id]);
        }.bind(this)) : [];

        this.params.got && this.params.got(components);
    };

    ListTemplate.prototype.onChange = function(prev, current){
        current.applyState("sync");
        this.collection.getChild(current.getId()).set(current.getItems(), function(err){
            current.applyState(err ? "error" : "ready");
        });

        this.params.changed && this.params.changed(prev, current);
    };

    ListTemplate.prototype.addToList = function(id, items) {
        var el = this.template.clone();
        this.listEl.append(el);

        var p = new this.TemplateProduct({id: id, items: items}, {onChange: this.onChange.bind(this)}).linkToDOM(el);

        el.find(".remove").click(this.remove.bind(this, p));

        this.products[id] = p;

        this.params.added && this.params.added(p);

        return p;
    };

    ListTemplate.prototype.addProduct = function(items) {
        var p = this.addToList("", items);
        p.applyState("sync");
        this.collection.push(p.getItems(), function(err, id){
            if(err) {
                ErrorWrapper(err);
                p.applyState("error");
            } else {
                p.setId(id);
                p.applyState("ready");
            }
        });
        return p;
    };

    ListTemplate.prototype.remove = function(p) {
        p.applyState("sync");
        this.collection.getChild(p.getId()).remove(function(err){
            if(err){
                ErrorWrapper(err);
                var el = this.template.clone();
                this.listEl.append(el);
                p.linkToDOM(el);
                p.applyState("error");
            } else {

            }
        }.bind(this));
        p.getEl().remove();
        delete this.products[p.getId()];

        this.params.removed && this.params.removed(p);
    };

    ListTemplate.prototype.clear = function () {
        this.products = {};
        this.listEl.children().remove();
    };

    return ListTemplate;
})();