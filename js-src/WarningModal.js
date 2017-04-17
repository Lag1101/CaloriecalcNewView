/**
 * Created by luckybug on 17.04.17.
 */

function WarningModal(id){
    this.modal = $("#" + id);
    this.textField = this.modal.find(".message")
    this.okBtn = this.modal.find(".ok");
    this.okBtn.on("click", this.onOk.bind(this));
    this.modal.find(".cancel").on("click", this.onCancel.bind(this));

    this.ok = null;
    this.cancel = null;
}

// var params = {
//     text: "",
//     ok: function(){},
//     cancel: function(){}
// }
WarningModal.prototype.Show = function(params){

    this.ok = params.ok;
    this.cancel = params.cancel;

    this.textField.text(params.text);

    this.okBtn.focus();

    this.modal.modal("show");
}

WarningModal.prototype.onOk = function(){
    this.ok && this.ok();
    this.modal.modal("hide");
}

WarningModal.prototype.onCancel = function(){
    this.cancel && this.cancel();
    this.modal.modal("hide");
}

module.exports = WarningModal;