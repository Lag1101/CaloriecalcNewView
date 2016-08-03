/**
 * Created by LuckyBug on 23.07.2016.
 */
(function(){
    const FirebaseWrapper = require("./FirebaseWrapper");
    const ErrorWrapper = require("./ErrorWrapper");
    const Template = require("./Template");

    $("#sign-out").click(function(){
        FirebaseWrapper.signOut(function(err){
            if(err)ErrorWrapper(err)
        });
    });

    $("#signup").click(function(){
        var s = getFormSerialize(authForm);
        FirebaseWrapper.createUser(s.email, s.password, function(err){
            if(err)ErrorWrapper(err)
        });
    });

    const alertInfoTemplate = new Template("#alert-info-template");
    const authModal = $("#auth-modal");
    const authForm = $("#auth-form");
    const userEmailLable = $("#userEmail");

    function getFormSerialize(form){
        var s = {};
        form.serializeArray().forEach(function(o){
            s[o.name] = o.value;
        });
        return s;
    }

    authForm.on("submit", function(){
        var s = getFormSerialize(authForm);

        FirebaseWrapper.signIn(s.email, s.password, function(err){
            if(err)ErrorWrapper(err)
        });
    });

    FirebaseWrapper.setOnSignedIn(function(user){

        if(user.emailVerified){
            userEmailLable.text("Hello " + user.email);
            authModal.modal('hide');

            const DB = new FirebaseWrapper.DB(user.uid);

            require("./RawProductsControl")(DB);
            require("./DishesControl")(DB);
            require("./ComponentsControl")(DB);
            require("./DailyControl")(DB);
        } else {
            authModal.modal('show');

            var alertInfo = alertInfoTemplate.clone();
            alertInfo.find(".alert-info-text").text("Please , verify your email");
            authModal.find(".modal-footer").append(alertInfo);
        }
    });

    FirebaseWrapper.setOnSignedOut(function(){
        authModal.modal('show');
    });

    FirebaseWrapper.setOnVerified(function(){
        console.log("verified");
    });
})();



