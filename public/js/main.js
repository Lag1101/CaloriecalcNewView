/**
 * Created by LuckyBug on 23.07.2016.
 */


const rawProductTemlate = new Template("#raw-product-temlate");

const rawProductList = $("#raw-product-list");
const newRawProductEl = $("#new-raw-product");



newRawProductEl.append(rawProductTemlate.clone());
const newRawProduct = new RawProduct("new-raw-product").linkToDOM(newRawProductEl);

var config = {
    apiKey: "AIzaSyAMNUgXUuSzUirS-Ub3fkUXz4BcPqY8gAw",
    authDomain: "caloriecalc-a8a40.firebaseapp.com",
    databaseURL: "https://caloriecalc-a8a40.firebaseio.com",
    storageBucket: "caloriecalc-a8a40.appspot.com",
};
firebase.initializeApp(config);



var auth = firebase.auth();
var userPromise = auth.signInWithEmailAndPassword('lomanovvasiliy@gmail.com','235901');

userPromise.catch(function(err){
    console.log(err)
});

userPromise.then(function(user){
    const rawProductsDB = firebase.database().ref(user.uid).child('raw-products');
    $("#add-raw-product").click(function(){
        var items = newRawProduct.getItems();

        rawProductsDB.push(items).then(function(p){
            var el = rawProductTemlate.clone();
            rawProductList.append(el);
            new RawProduct(p.key, items).linkToDOM(el);
        });
    });
});
