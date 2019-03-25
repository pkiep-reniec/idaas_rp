/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

$(document).ready(function () {
    $('#btn_logout').click(function (e) {
        e.preventDefault();

        localStorage.clear();

        ReniecIDaaS.init({
            clientId: CLIENT_ID
        });

        ReniecIDaaS.logout(BASE_URL);
    });

    var bootstrap = function () {
        authResponse = JSON.parse(localStorage.getItem('authResponse'));
        procJson(authResponse.idTokenParser, 'content_idtoken');

        if (authResponse.userInfo) {
            $('.userinfo').show();
            procJson(authResponse.userInfo, 'content_userinfo');
        } else {
            $('.userinfo').hide();
        }
    };

    bootstrap();
});