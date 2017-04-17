/**
 * Created by luckybug on 27.07.16.
 */

function fixPrecision(v){
    return parseFloat(v.toFixed(2))
}

module.exports = (function(){
    //const $ = require("jquery");
    const Template = require("./Template");
    const ErrorWrapper = require("./ErrorWrapper");
    const TemplateList = require("./TemplateList");
    
    const Dish = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "full-proteins", default: 0},
        {name: "full-triglyceride", default: 0},
        {name: "full-carbohydrate", default: 0},
        {name: "full-calories", default: 0},
        {name: "full-mass", default: 100},
        {name: "portion-proteins", default: 0},
        {name: "portion-triglyceride", default: 0},
        {name: "portion-carbohydrate", default: 0},
        {name: "portion-calories", default: 0},
        {name: "portion-mass", default: 100}
    ]);
    const PubSub = require("pubsub-js");

    const template = new Template("#dish-template");
    const newDishEl = $("#new-dish");
    const addNewDishEl = $("#add-new-dish");

    const newDish = new Dish({id: "new-raw-product"}, {
        onChange: function(prev, cur){
            updatePortion(cur);
        }
    }).linkToDOM(newDishEl);

    const itemNames = [
        "proteins",
        "triglyceride",
        "carbohydrate",
        "calories"
    ];

    function updatePortion(dish) {
        var dishItems = dish.getItems();
        var fullMass = parseFloat(dishItems["full-mass"]);
        var portionMass = parseFloat(dishItems["portion-mass"]);

        if(!fullMass) return;

        itemNames.forEach(function(name){
            dishItems["portion-" + name] = fixPrecision(dishItems["full-" + name] * portionMass / fullMass);
        });
        dish.setItems(dishItems);
        dish.updateEl();
    }

    function onDBReady(DB){
        const collection = DB.getChild('dishes');

        const dishList = new TemplateList({
            collection:  collection,
            changed: function(prev, current) {
                updatePortion(current);
                current.applyState("sync");
                collection.getChild(current.getId()).set(current.getItems(), function(err){
                    current.applyState(err ? "error" : "ready");
                });
                updatePortion(current)
            },
            removed: function (p) {

            },
            added: function (p) {
                dailyPartsNames.forEach(function(name){
                    var dishName = "set-" + name;
                    p.getEl().find("." + dishName).on("click", function (event) {
                        var items = p.getItems();
                        PubSub.publish(dishName, {
                            description: items.description,
                            proteins: items["portion-proteins"],
                            triglyceride: items["portion-triglyceride"],
                            carbohydrate: items["portion-carbohydrate"],
                            calories: items["portion-calories"],
                            mass: items["portion-mass"]
                        });
                        event.preventDefault();
                    })
                });
            },
            got: function (products) {
                PubSub.publish( 'ComponentsListReady', products );
            },

            TemplateProduct: Dish,
            listEl: $("#dish-list"),
            template: template,
            confirmRemove: true
        });
        const dailyPartsNames = [
            "breakfast",
            "lunch",
            "dinner",
            "snack",
            "second-dinner",
            "bedtime",
            "additional"
        ];
        addNewDishEl.click(function(){
            dishList.addProduct(newDish.getItems());
        });

        PubSub.subscribe( 'ComponentChanged', function(msg, h){
            var prev = h.prev;
            var current = h.current;
            var dishItems = newDish.getItems();

            var prevItems = prev.getItems();
            var currentItems = current.getItems();

            var prevMass = parseFloat(prevItems["mass"] || 0);
            var currentMass = parseFloat(currentItems["mass"] || 0);

            itemNames.forEach(function(name){
                var base = parseFloat(dishItems["full-" + name] || 0);
                var pr = parseFloat(prevItems[name] || 0) * prevMass / 100;
                var cu = parseFloat(currentItems[name] || 0) * currentMass / 100;
                dishItems["full-" + name] = fixPrecision(base - pr + cu);
            });

            newDish.setItems(dishItems);
            updatePortion(newDish);
        });
    }

    return onDBReady;
})();