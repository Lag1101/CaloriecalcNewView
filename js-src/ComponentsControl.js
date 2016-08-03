/**
 * Created by LuckyBug on 26.07.2016.
 */

module.exports = (function(){

    //const $ = require("jquery");
    const ErrorWrapper = require("./ErrorWrapper");
    const TemplateList = require("./TemplateList");
    const Template = require("./Template");
    const PubSub = require("pubsub-js");

    const Component = require("./TemplateProduct").bind(null , [
        {name: "description", default: ""},
        {name: "proteins", default: 0},
        {name: "triglyceride", default: 0},
        {name: "carbohydrate", default: 0},
        {name: "calories", default: 0},
        {name: "mass", default: 100}
    ]);

    function onDBReady(DB) {
        const componentsList = new TemplateList({
            collection:  DB.getChild('components'),
            changed: function(prev, current) {
                PubSub.publish( 'ComponentChanged', {
                    prev: prev,
                    current: current
                } );
            },
            removed: function (p) {
                PubSub.publish( 'ComponentChanged', {
                    prev: new Component({items: p.getItems()}),
                    current: new Component()
                } );
            },
            added: function (p) {
                PubSub.publish( 'ComponentChanged', {
                    prev: new Component(),
                    current: new Component({items: p.getItems()})
                } );
            },
            got: function (products) {
                PubSub.publish( 'ComponentsListReady', products );
            },

            TemplateProduct: Component,
            listEl: $("#components-list"),
            template: new Template("#component-template")
        });
        PubSub.subscribe( 'AddRawProductToComponents', function(msg, items){
            componentsList.addProduct(items);
        });
    }

    return onDBReady;
})();