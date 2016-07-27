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

        collection.getValue(function(err, componentsRes) {
            if(err) {
                ErrorWrapper(err);
            } else {
                onGetComponents(componentsRes);
            }
        });

        function onGetComponents(componentsRes){
            var components = componentsRes ? Object.keys(componentsRes).map(function(id){
                return addToList(id, componentsRes[id]);
            }) : [];

            PubSub.publish( 'ComponentsListReady', components );

            function remove(p) {
                p.applyState("sync");
                collection.getChild(p.getId()).remove(function(err){
                    if(err){
                        ErrorWrapper(err);
                        p.applyState("error");
                    } else {
                    }
                });

                PubSub.publish( 'ComponentChanged', {
                    prev: new Component({items: p.getItems()}),
                    current: new Component()
                } );
                p.getEl().remove();
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
                PubSub.publish( 'ComponentChanged', {
                    prev: new Component(),
                    current: new Component({items: items})
                } );
            });

            function onChange(prev, current){
                current.applyState("sync");
                collection.getChild(current.getId()).set(current.getItems(), function(err){
                    current.applyState(err ? "error" : "ready");
                });
                PubSub.publish( 'ComponentChanged', {
                    prev: prev,
                    current: current
                } );
            }
        }
    }
    return onUserReady;
})();