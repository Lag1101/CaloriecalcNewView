/**
 * Created by LuckyBug on 28.07.2016.
 */



module.exports = (function(){
    const $ = require("jquery");
    const ErrorWrapper = require("./ErrorWrapper");
    const TemplateList = require("./TemplateList");
    const Template = require("./Template");
    const PubSub = require("pubsub-js");
    const list = $("#daily-list");

    const ProductTemplate = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "proteins", default: 0},
        {name: "triglyceride", default: 0},
        {name: "carbohydrate", default: 0},
        {name: "calories", default: 0},
        {name: "details", default: ""}
    ]);

    const template = new Template("#daily-product-template");

    const dailyPartsNames = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "second-dinner",
        "bedtime"
    ];

    const dailyParts = dailyPartsNames.map(function(name){
        var el = list.find("." + name);
        return new ProductTemplate({id: name}).linkToDOM(el);
    });

    function onDBReady(DB) {
        const componentsList = new TemplateList({
            collection:  DB.getChild('daily').getChild(new Date().getDate()),
            changed: function(prev, current) {

            },
            removed: function (p) {

            },
            added: function (p) {

            },
            got: function (products) {
                if(products.length === 0) {
                    dailyParts.forEach(function(part){
                        componentsList.addProduct()
                    });
                }
            },

            TemplateProduct: ProductTemplate,
            listEl: list,
            template: template
        });

    }

    return onDBReady;
})();