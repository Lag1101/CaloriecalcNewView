/**
 * Created by LuckyBug on 26.07.2016.
 */

module.exports = (function(){


    const $ = require("jquery");
    const Template = require("./Template");
    const ErrorWrapper = require("./ErrorWrapper");
    const RawProduct = require("./TemplateProduct").bind(null , [
            {name: "description", default: ""},
            {name: "proteins", default: 0},
            {name: "triglyceride", default: 0},
            {name: "carbohydrate", default: 0},
            {name: "calories", default: 0}
    ]);
    const PubSub = require("pubsub-js");
    const template = new Template("#raw-product-template");

    const rawProductList = $("#raw-product-list");
    const newRawProductEl = $("#new-raw-product");
    const addRawProductEl = $("#add-raw-product");



    newRawProductEl.append(template.clone());
    const newRawProduct = new RawProduct({id: "new-raw-product"}).linkToDOM(newRawProductEl);


    function onUserReady(DB) {
        const rawProductsCollection = DB.getChild('raw-products');

        function removeByProduct(p) {
            p.applyState("sync");
            rawProductsCollection.getChild(p.getId()).remove(function(err){
                if(err){
                    ErrorWrapper(err);
                    var el = template.clone();
                    rawProductList.append(el);
                    p.linkToDOM(el);
                    p.applyState("error");
                } else {
                }
            });
            p.getEl().remove();
        }

        function addToComponents(p) {
            PubSub.publish( 'AddRawProductToComponents', p.getItems() );
        }

        function addRawProductToProductList(id, items) {
            var el = template.clone();
            rawProductList.append(el);

            var p = new RawProduct({id: id, items: items}, {onChange: onChange}).linkToDOM(el);

            el.find(".remove-raw-product").click(removeByProduct.bind(null, p));
            el.find(".add-to-components").click(addToComponents.bind(null, p));

            return p;
        }

        rawProductsCollection.getValue(function(err, rawProductsRes) {
            if(err) {
                ErrorWrapper(err);
            } else {
                Object.keys(rawProductsRes).map(function(id){
                    return addRawProductToProductList(id, rawProductsRes[id]);
                });
            }
        });

        addRawProductEl.click(function(){
            var p = addRawProductToProductList("", newRawProduct.getItems());
            p.applyState("sync");
            rawProductsCollection.push(p.getItems(), function(err, id){
                if(err) {
                    ErrorWrapper(err);
                    p.applyState("error");
                } else {
                    p.setId(id);
                    p.applyState("ready");
                }
            });
        });


        function onChange(prev, current){
            current.applyState("sync");
            rawProductsCollection.getChild(current.getId()).set(current.getItems(), function(err){
                current.applyState(err ? "error" : "ready");
            });
        }
    }
    return onUserReady;
})();