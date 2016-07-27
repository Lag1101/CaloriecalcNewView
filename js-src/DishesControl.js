/**
 * Created by luckybug on 27.07.16.
 */

module.exports = (function(){


    const $ = require("jquery");
    const Template = require("./Template");
    const ErrorWrapper = require("./ErrorWrapper");
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
    const list = $("#dish-list");
    const addNewDishEl = $("#add-new-dish");

    newDishEl.append(template.clone());
    const newDish = new Dish({id: "new-raw-product"}, {onChange: function(prev, cur){
        updatePortion(cur);
    }}).linkToDOM(newDishEl);

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
            dishItems["portion-" + name] = dishItems["full-" + name] * portionMass / fullMass;
        });
        dish.setItems(dishItems);
        dish.updateEl();
    }

    function onUserReady(DB) {
        const collection = DB.getChild('dishes');

        collection.getValue(function(err, res) {
            if(err) {
                ErrorWrapper(err);
            } else {
                onGetDishes(res);
            }
        });

        PubSub.subscribe( 'ComponentsListReady', function(msg, components){
            console.log(components);

            var newDishItems = newDish.getItems();
            itemNames.forEach(function(name){
                newDishItems["full-" + name] = 0;
            });

            components.forEach(function(component){
                var items = component.getItems();
                var mass = parseFloat(items["mass"] || 0);
                itemNames.forEach(function(name){
                    newDishItems["full-" + name] += parseFloat(items[name] || 0) * mass / 100;
                });
            });


            newDish.setItems(newDishItems);
            updatePortion(newDish);
        });


        function addToList(id, items) {
            var el = template.clone();
            list.append(el);

            var p = new Dish({id: id, items: items}, {onChange:dishChanged}).linkToDOM(el);

            el.find(".remove-dish").click(remove.bind(null, p));

            return p;
        }

        function dishChanged(prev, current) {
            updatePortion(current);
            current.applyState("sync");
            collection.getChild(current.getId()).set(current.getItems(), function(err){
                current.applyState(err ? "error" : "ready");
            });
            updatePortion(current);
        }

        function remove(p) {
            p.applyState("sync");
            collection.getChild(p.getId()).remove(function(err){
                if(err){
                    ErrorWrapper(err);
                    p.applyState("error");
                } else {
                }
            });
            p.getEl().remove();
        }

        addNewDishEl.click(function(){
            var p = addToList("", newDish.getItems());
            p.applyState("sync");
            collection.push(p.getItems(), function(err, id){
                if(err) {
                    ErrorWrapper(err);
                    p.applyState("error");
                } else {
                    p.setId(id);
                    p.applyState("ready");
                }
            });
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
                dishItems["full-" + name] = base - pr + cu;
            });

            newDish.setItems(dishItems);
            updatePortion(newDish);
        });

        function onGetDishes(dishesRes){
            var dishes = dishesRes ? Object.keys(dishesRes).map(function(id){
                return addToList(id, dishesRes[id]);
            }) : [];
        }
    }
    return onUserReady;
})();