/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

$(document).ready(function () {
    var bootstrap = function () {
        //Auth Endpoint
        procJson(JSON.parse(atob(resAuth)), 'content_auth');

        //Token Endpoint
        procJson(JSON.parse(atob(resToken)), 'content_token');

        //UserInfo Endpoint
        procJson(JSON.parse(atob(resUser)), 'content_userinfo');
    };

    bootstrap();
});