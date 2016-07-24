/**
 * Created by LuckyBug on 24.07.2016.
 */



const FirebaseWrapper = (function(){
    const config = {
        apiKey: "AIzaSyAMNUgXUuSzUirS-Ub3fkUXz4BcPqY8gAw",
        authDomain: "caloriecalc-a8a40.firebaseapp.com",
        databaseURL: "https://caloriecalc-a8a40.firebaseio.com",
        storageBucket: "caloriecalc-a8a40.appspot.com",
    };
    firebase.initializeApp(config);


    const FirebaseWrapper = {};

    const auth = firebase.auth();

    console.log(auth.currentUser);

    FirebaseWrapper.signIn = function(email, pass, cb) {
        auth.signInWithEmailAndPassword(email,pass)
            .catch(function(err){
                return cb(err);
            })
            .then(function(user){
                return cb(null, user.uid);
            });
    };

    const db = firebase.database();

    FirebaseWrapper.DB = function(uid) {
        this.db = db.ref(uid);
    };

    var DB = FirebaseWrapper.DB;

    FirebaseWrapper.Collection = function(collection) {
        this.collection = collection;
    };

    var Collection = FirebaseWrapper.Collection;

    DB.prototype.getChild = function(name) {
        return new Collection(this.db.child(name));
    };

    Collection.prototype.getChild = function(name) {
        return new Collection(this.collection.child(name));
    };

    FirebaseWrapper.Collection.prototype.getValue = function(cb) {
        this.collection.once("value", function(res) {
            return cb && cb(null, res.val());
        }, function(err){
            return cb && cb(err);
        });
    };

    FirebaseWrapper.Collection.prototype.push = function(data, cb) {
        this.collection.push(data)
            .catch(function(err){
                return cb && cb(err);
            })
            .then(function(res){
                return cb && cb(null, res.key);
            });
    };

    FirebaseWrapper.Collection.prototype.set = function(data, cb) {
        this.collection.set(data)
            .catch(function(err){
                return cb && cb(err);
            })
            .then(function(res){
                return cb && cb(res);
            });
    };

    return FirebaseWrapper;
})();