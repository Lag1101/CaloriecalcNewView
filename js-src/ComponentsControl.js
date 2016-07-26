/**
 * Created by LuckyBug on 26.07.2016.
 */

module.exports = (function(){


    const $ = require("jquery");
    const Template = require("./Template");
    const ErrorWrapper = require("./ErrorWrapper");
    const Component = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "proteins", default: 0},
        {name: "triglyceride", default: 0},
        {name: "carbohydrate ", default: 0},
        {name: "calories", default: 0},
        {name: "mass", default: 100}
    ]);
    const PubSub = require("pubsub-js");

    const template = new Template("#component-template");

    const list = $("#components-list");


    function onUserReady(DB) {
        const collection = DB.getChild('components');

        function remove(p) {
            p.applyState("sync");
            collection.getChild(p.getId()).remove(function(err){
                if(err){
                    ErrorWrapper(err);
                    p.applyState("error");
                } else {
                    p.getEl().remove();
                }
            });
        }

        function addToList(id, items) {
            var el = template.clone();
            list.append(el);

            var p = new Component({id: id, items: items}, {onChange: onChange}).linkToDOM(el);

            el.find(".remove-component").click(remove.bind(null, p));

            return p;
        }

        PubSub.subscribe( 'AddRawProductToComponents', function(msg, items){
            var p = addToList("", items);
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

        collection.getValue(function(err, componentsRes) {
            if(err) {
                ErrorWrapper(err);
            } else {
                Object.keys(componentsRes).map(function(id){
                    addToList(id, componentsRes[id]);
                });
            }
        });


        function onChange(p){
            p.applyState("sync");
            collection.getChild(p.id).set(p.getItems(), function(err){
                p.applyState(err ? "error" : "ready");
            });
        }
    }
    return onUserReady;
})();