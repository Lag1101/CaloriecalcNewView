/**
 * Created by LuckyBug on 23.07.2016.
 */


const rawProductTemlate = new Template("#raw-product-temlate");

const rawProductList = $("#raw-product-list");
const newRawProductEl = $("#new-raw-product");

$("#add-raw-product").click(function(){
    //var el = rawProductTemlate.clone();

    //rawProductList.append(el);

    //newRawProduct.cloneWithoutId().linkToDOM(el);

    rawProductsDB.push(newRawProduct.cloneWithoutId(), function(err, d){
        console.log(err, d);
    });
});

newRawProductEl.append(rawProductTemlate.clone());
const newRawProduct = new RawProduct({id: "new-raw-product"}).linkToDOM(newRawProductEl);

const config = {
    apiKey: "AIzaSyCbbxo6XnIqbRhHp8r6HuB64e0L0Bcvj8Q",
    authDomain: "CalorieCalc.firebaseapp.com",
    databaseURL: "https://CalorieCalc.firebaseio.com/",
    storageBucket: "",
};
const firebase = new Firebase(config);


// firebase.auth().signInAnonymously().catch(function(error) {
//     console.error(error);
// });

var rawProductsDB = firebase.database().ref('CalorieCalcDB').child('raw-products');
