function procJson(data, id, idToken) {
    jData = JSON.parse(data);

    element = document.getElementById(id);
    treeToken = jsonTree.create(jData, element);

    if (idToken) {
        if (jData.id_token) {
            $('.show-idtoken').show();

            wIdToken = document.getElementById("content_idtoken");
            treeIdToken = jsonTree.create(parseJwt(jData.id_token), wIdToken);
        }
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function encodeQueryData(data) {
    let ret = [];
    for (let d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

$(document).ajaxError(function (event, jqxhr, settings, err) {
    loading(false);
    alert('Ha ocurrido un error, por favor vuelve a intentarlo');
});