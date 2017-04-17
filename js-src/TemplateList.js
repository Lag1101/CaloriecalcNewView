/**
 * Created by luckybug on 27.07.16.
 */

module.exports = (function(){

    const ErrorWrapper = require("./ErrorWrapper");
    const Warning = require("./WarningModal");

    function ListTemplate(params) {

        this.params = params || {};
        this.collection = this.params.collection;
        this.template = this.params.template;
        this.listEl = this.params.listEl;
        this.TemplateProduct = this.params.TemplateProduct;
        this.sortFunc = this.params.sortFunc;

        this.products = {};
        this.productsList = [];

        this.collection.getValue(function(err, res) {
            if(err) {
                ErrorWrapper(err);
            } else {
                this.onGet(res);
            }
        }.bind(this));

        this.confirmRemove = !!params.confirmRemove;

    }

    ListTemplate.prototype.onGet = function(componentsRes){
        var ids = Object.keys(componentsRes);

        var sortFunc = this.sortFunc;
        if(sortFunc){
            ids = ids.sort(function (a, b) {
                return sortFunc(componentsRes[a], componentsRes[b]);
            });
        }
        var components = componentsRes ? ids.map(function(id){
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

        var sortFunc = this.sortFunc;
        if(sortFunc){
            var iterEl = null;
            for(var i = 0; i < this.productsList.length; i++){
                var p = this.productsList[i];
                if(sortFunc(items, p.getItems()) <= 0){
                    iterEl = p.getEl();
                    break;
                }
            }

            if(iterEl === null){
                this.listEl.append(el);
            } else {
                el.insertBefore(iterEl);
            }
        } else {
            this.listEl.append(el);
        }

        var p = new this.TemplateProduct({id: id, items: items}, {onChange: this.onChange.bind(this)}).linkToDOM(el);

        el.find(".remove").click(this.remove.bind(this, p));

        this.products[id] = p;
        this.productsList.push(p);

        if(sortFunc){
            this.productsList = this.productsList.sort(function (a, b) {
                return sortFunc(a.getItems(), b.getItems());
            });
        }

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

    const warning = new Warning("confirm-modal");
    ListTemplate.prototype.remove = function(p) {

        var remove = function(){
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

            for(var i = 0; i < this.productsList.length; i++){
                if (p.getId() === this.productsList[i].getId()) {
                    this.productsList.splice(i, 1);
                    break;
                }
            }

            delete this.products[p.getId()];

            this.params.removed && this.params.removed(p);
        }.bind(this);

        if(this.confirmRemove) {
            warning.Show({
                text: "Удалить " + p.getItems()["description"] + " ?",
                ok: remove
            });
        } else {
            remove();
        }

    };

    ListTemplate.prototype.clear = function () {
        this.products = {};
        this.productsList = [];
        this.listEl.children().remove();
    };

    return ListTemplate;
})();