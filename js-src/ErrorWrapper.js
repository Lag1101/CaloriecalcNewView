/**
 * Created by LuckyBug on 24.07.2016.
 */

module.exports = (function(){
    function ErrorWrapper(err) {
        const errorModal = $("#error-modal");
        const errorText = errorModal.find(".alert-error-text");

        errorText.text(err);

        errorModal.modal("show");

        console.log(err);
    }
    return ErrorWrapper;
})();