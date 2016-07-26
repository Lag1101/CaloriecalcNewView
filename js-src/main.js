/**
 * Created by LuckyBug on 23.07.2016.
 */
(function(){


    const $ = require("jquery");
    const FirebaseWrapper = require("./FirebaseWrapper");
    const ErrorWrapper = require("./ErrorWrapper");



    FirebaseWrapper.signIn('lomanovvasiliy@gmail.com','235901', function(err, uid){
        if(err) {
            ErrorWrapper(err);
        } else {
            const DB = new FirebaseWrapper.DB(uid);

            require("./ComponentsControl")(DB);
            require("./RawProductsControl")(DB);
        }
    });
})();


