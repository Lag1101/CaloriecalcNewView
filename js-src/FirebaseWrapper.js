/**
 * Created by LuckyBug on 24.07.2016.
 */


module.exports = (function(){
    const config = {
        apiKey: "AIzaSyAMNUgXUuSzUirS-Ub3fkUXz4BcPqY8gAw",
        authDomain: "caloriecalc-a8a40.firebaseapp.com",
        databaseURL: "https://caloriecalc-a8a40.firebaseio.com",
        storageBucket: "caloriecalc-a8a40.appspot.com",
    };

    const firebase = require("firebase");

    firebase.initializeApp(config);


    const FirebaseWrapper = {};

    const auth = firebase.auth();

    const db = firebase.database();


    FirebaseWrapper.DB = function(uid) {
        this.db = db.ref(uid);
        this.db.child("LastOnline").onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
    };


    const DB = FirebaseWrapper.DB;

    function sync(){
        DB.goOnline();
        DB.goOffline();
    }

    setInterval(sync, 15000);

    var onlineRequests = 0;
    DB.goOffline = function() {
        //onlineRequests --;
        //if(onlineRequests === 0) {
        //
        //    setTimeout(function(){
        //        //console.log("offline");
        //        db.goOffline();
        //        DB.onChangeOnline(false);
        //    }, 2000);
        //}
    };

    DB.setOnChangeOnline = function(cb){
        DB.onChangeOnline = cb;
    };

    DB.goOnline = function() {
        onlineRequests ++;
        db.goOnline();
        DB.onChangeOnline(true);
        //console.log("online");
    };


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
                return cb && cb(null, res);
            });
    };

    FirebaseWrapper.signIn = function(email, password, cb) {
        auth.signInWithEmailAndPassword(email, password)
            .then(function(){
                return cb();
            })
            .catch(function(error) {
                return cb(error);
            });
    };

    FirebaseWrapper.signOut = function(cb) {
        auth.signOut().catch(cb).then(cb);
    };

    FirebaseWrapper.Collection.prototype.remove = function(cb) {
        this.collection.remove(cb);
    };

    FirebaseWrapper.SignUp = function (email, password, cb) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(function(){
                return cb();
            })
            .catch(function(error) {
                return cb(error);
            });
    };
    /**
     * Sends an email verification to the user.
     */

    FirebaseWrapper.createUser = function (email, password, cb) {
        auth.createUserWithEmailAndPassword(email, password)
            .then(function() {
                FirebaseWrapper.sendEmailVerification(cb)
            })
            .catch(function(error) {
                return cb(error);
            });
    };

    FirebaseWrapper.sendEmailVerification = function (cb) {
        auth.currentUser.sendEmailVerification()
            .then(function(){
                return cb();
            })
            .catch(function(error) {
                return cb(error);
            });
    };

    FirebaseWrapper.sendPasswordReset = function (email, cb) {
        auth.sendPasswordResetEmail(email)
            .then(function() {
                return cb();
            }).catch(function(error) {
                return cb(error);
            });
    };

    FirebaseWrapper.setOnSignedIn = function(cb) {
        FirebaseWrapper.onSignedIn = cb;
    };

    FirebaseWrapper.setOnSignedOut = function(cb) {
        FirebaseWrapper.onSignedOut = cb;
    };

    FirebaseWrapper.setOnVerified = function(cb) {
        FirebaseWrapper.onVerified = cb;
    };

    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var refreshToken = user.refreshToken;
            var providerData = user.providerData;


            FirebaseWrapper.onSignedIn && FirebaseWrapper.onSignedIn(user);
            //if (emailVerified) {
            //    //FirebaseWrapper.onVerified && FirebaseWrapper.onVerified(user);
            //}
        } else {
            FirebaseWrapper.onSignedOut && FirebaseWrapper.onSignedOut();
        }
    });

    return FirebaseWrapper
})();
