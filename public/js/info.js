$(document).ready(function () {
    var bootstrap = function () {
        //Auth Endpoint
        procJson(atob(resAuth), 'content_auth', false);

        //Token Endpoint
        procJson(atob(resToken), 'content_token', true);

        //UserInfo Endpoint
        procJson(atob(resUser), 'content_userinfo', false);
    };

    bootstrap();
});