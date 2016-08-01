/**
 * Created by LuckyBug on 28.07.2016.
 */



module.exports = (function(){
    const $ = require("jquery");
    const ErrorWrapper = require("./ErrorWrapper");
    const TemplateList = require("./TemplateList");
    const Template = require("./Template");
    const PubSub = require("pubsub-js");
    const generalListEl = $("#daily-general-list");
    const additionalListEl = $("#daily-additional-list");
    const DailyPicker = $("#daily-picker");

    const ProductTemplate = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "proteins", default: 0},
        {name: "triglyceride", default: 0},
        {name: "carbohydrate", default: 0},
        {name: "calories", default: 0},
        {name: "details", default: ""}
    ]);

    const generalTemplate = new Template("#daily-general-product-template");
    const additionalTemplate = new Template("#daily-additional-product-template");

    const dailyPartsNames = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "second-dinner",
        "bedtime"
    ];

    function onDBReady(DB) {
        var generalList = null;
        var additionalList = null;
        function constructByDate(date) {
            if(generalList) generalList.clear();
            if(additionalList) additionalList.clear();

            generalList = new TemplateList({
                collection:  DB.getChild('daily').getChild("general").getChild(date),
                changed: function(prev, current) {

                },
                removed: function (p) {

                },
                added: function (p) {

                },
                got: function (products) {
                    if(products.length === 0) {
                        dailyPartsNames.forEach(function(part){
                            generalList.addProduct(new ProductTemplate({id: part}));
                        });
                    }

                    var i = 0;
                    Object.keys(generalList.products).forEach(function(key){
                        var el = generalList.products[key].getEl();
                        el.find(".daily-lable").val(dailyPartsNames[i]);
                        i++;
                    });
                },

                TemplateProduct: ProductTemplate,
                listEl: generalListEl,
                template: generalTemplate
            });

            additionalList = new TemplateList({
                collection:  DB.getChild('daily').getChild("additional").getChild(date),
                changed: function(prev, current) {

                },
                removed: function (p) {

                },
                added: function (p) {

                },
                got: function (products) {

                },

                TemplateProduct: ProductTemplate,
                listEl: additionalListEl,
                template: additionalTemplate
            });
        }

        const newRawProductEl = $("#new-daily-product");

        const addRawProductEl = $("#add-daily-product");

        const newRawProduct = new ProductTemplate({id: "new-daily-product"}).linkToDOM(newRawProductEl);

        addRawProductEl.click(function(){
            console.log(newRawProduct.getItems());
            additionalList.addProduct(newRawProduct.getItems());
        });

        function today() {
            var now = new Date();

            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);

            return now.getFullYear()+"-"+(month)+"-"+(day) ;
        }

        DB.getChild('daily').getChild("lastDay").getValue(function(err, date){
            if(err) {
                ErrorWrapper(err);
            } else if(!date) {
                DailyPicker.val(today());
                DB.getChild('daily').getChild("lastDay").set(DailyPicker.val(), function(err) {
                    if(err) ErrorWrapper(err);
                });
                constructByDate(DailyPicker.val())
            } else {
                DailyPicker.val(date);
                constructByDate(date)
            }
        });

        DailyPicker.on("change", function(){
            DB.getChild('daily').getChild("lastDay").set(DailyPicker.val(), function(err) {
                if(err) ErrorWrapper(err);
            });
            constructByDate(DailyPicker.val())
        });
    }

    return onDBReady;
})();