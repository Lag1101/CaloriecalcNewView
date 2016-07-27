/**
 * Created by LuckyBug on 26.07.2016.
 */

module.exports = (function(){

    const $ = require("jquery");
    const ErrorWrapper = require("./ErrorWrapper");
    const TemplateList = require("./TemplateList");
    const Template = require("./Template");
    const PubSub = require("pubsub-js");

    const Component = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "proteins", default: 0},
        {name: "triglyceride", default: 0},
        {name: "carbohydrate", default: 0},
        {name: "calories", default: 0}
    ]);

    const template = new Template("#raw-product-template");


    function onDBReady(DB) {
        const componentsList = new TemplateList({
            collection:  DB.getChild('raw-products'),
            changed: function(prev, current) {

            },
            removed: function (p) {

            },
            added: function (p) {
                p.getEl().find(".add-to-components").click(function(){
                    PubSub.publish( 'AddRawProductToComponents', p.getItems() );
                });
            },
            got: function (products) {

            },

            TemplateProduct: Component,
            listEl: $("#raw-product-list"),
            template: template
        });

        const newRawProductEl = $("#new-raw-product");
        newRawProductEl.append(template.clone());

        const addRawProductEl = $("#add-raw-product");

        const newRawProduct = new Component({id: "new-raw-product"}).linkToDOM(newRawProductEl);

        addRawProductEl.click(function(){
            componentsList.addProduct(newRawProduct.getItems());
        });
    }

    return onDBReady;
})();