/**
 * Created by LuckyBug on 23.07.2016.
 */
(function(){


    const $ = require("jquery");
    const Template = require("./Template");
    const FirebaseWrapper = require("./FirebaseWrapper");
    const ErrorWrapper = require("./ErrorWrapper");
    const RawProduct = require("./RawProduct");

    const rawProductTemplate = new Template("#raw-product-template");

    const rawProductList = $("#raw-product-list");
    const newRawProductEl = $("#new-raw-product");
    const addRawProductEl = $("#add-raw-product");



    newRawProductEl.append(rawProductTemplate.clone());
    const newRawProduct = new RawProduct({id: "new-raw-product"}).linkToDOM(newRawProductEl);



    FirebaseWrapper.signIn('lomanovvasiliy@gmail.com','235901', function(err, uid){
        if(err) {
            ErrorWrapper(err);
        } else {

            console.log("signed");

            const DB = new FirebaseWrapper.DB(uid);
            const rawProductsCollection = DB.getChild('raw-products');

            function removeByProduct(p) {
                p.applyState("sync");
                rawProductsCollection.getChild(p.getId()).remove(function(err){
                    if(err){
                        ErrorWrapper(err);
                        p.applyState("error");
                    } else {
                        p.getEl().remove();
                    }
                });
            }

            function addRawProductToProductList(id, items) {
                var el = rawProductTemplate.clone();
                rawProductList.append(el);

                var p = new RawProduct({id: id, items: items}, {onChange: onChange}).linkToDOM(el);

                el.find(".remove-raw-product").click(removeByProduct.bind(null, p));

                return p;
            }

            rawProductsCollection.getValue(function(err, rawProductsRes) {
                if(err) {
                    ErrorWrapper(err);
                } else {
                    Object.keys(rawProductsRes).map(function(id){
                        addRawProductToProductList(id, rawProductsRes[id]);
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


            function onChange(p){
                p.applyState("sync");
                rawProductsCollection.getChild(p.id).set(p.getItems(), function(err){
                    p.applyState(err ? "error" : "ready");
                });
            }
        }
    });
})();


