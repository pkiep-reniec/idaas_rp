/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

$(document).ajaxError(function (event, jqxhr, settings, err) {
    loading(false);
    alert('Ha ocurrido un error, por favor vuelve a intentarlo');
});