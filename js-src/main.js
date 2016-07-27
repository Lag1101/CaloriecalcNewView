/**
 * Created by LuckyBug on 23.07.2016.
 */
(function(){
    const FirebaseWrapper = require("./FirebaseWrapper");
    const ErrorWrapper = require("./ErrorWrapper");
    const TemplateList = require("./TemplateList");


    FirebaseWrapper.signIn('lomanovvasiliy@gmail.com','235901', function(err, uid){
        if(err) {
            ErrorWrapper(err);
        } else {
            const DB = new FirebaseWrapper.DB(uid);

            require("./RawProductsControl")(DB);
            require("./DishesControl")(DB);
            require("./ComponentsControl")(DB);
        }
    });
})();


