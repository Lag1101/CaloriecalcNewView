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
    const FirebaseWrapper = require("./FirebaseWrapper");

    const ProductTemplate = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "proteins", default: 0},
        {name: "triglyceride", default: 0},
        {name: "carbohydrate", default: 0},
        {name: "calories", default: 0},
        {name: "details", default: ""}
    ]);

    const additionalTemplate = new Template("#daily-additional-product-template");

    const dailyPartsNames = [
        "breakfast",
        "lunch",
        "dinner",
        "snack",
        "second-dinner",
        "bedtime"
    ];

    const dailyParts = {};
    dailyPartsNames.forEach(function(name){
        dailyParts[name] = new ProductTemplate({id: name}).linkToDOM(generalListEl.find("." + name));
    });

    function onDBReady(DB) {
        var additionalList = null;
        function constructByDate(date) {
            if(additionalList) additionalList.clear();

            dailyPartsNames.forEach(function(name){
                var p = dailyParts[name];
                p.setItemsToDefault({});
                p.updateEl();
                p.setOnChange();
            });

            var ref = DB.getChild('daily').getChild("general").getChild(date);
            FirebaseWrapper.DB.goOnline();
            ref.getValue(function(err, res){
                FirebaseWrapper.DB.goOffline();
                if(err) {
                    ErrorWrapper(err);
                    return;
                } else if (!res){
                    var cur = {};
                    dailyPartsNames.forEach(function(name){
                        cur[name] = dailyParts[name].getItems();
                    });
                    DB.getChild('daily').getChild("general").getChild(date).set(cur, function(err){
                        if (err) ErrorWrapper(err);
                    });
                } else {
                    dailyPartsNames.forEach(function(name){
                        dailyParts[name].setItems(res[name]);
                        dailyParts[name].updateEl();
                    });
                }

                dailyPartsNames.forEach(function(name){
                    var p = dailyParts[name];
                    p.setOnChange(function(prev, cur){
                        cur.applyState("sync");
                        ref.getChild(name).set(cur.getItems(), function(){
                            if(err) {
                                cur.applyState("error");
                            } else {
                                cur.applyState("ready");
                            }
                        });
                    });
                });
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