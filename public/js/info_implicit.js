var idaas = {};

$(document).ready(function () {
    $('#btn_logout').click(function (e) {
        e.preventDefault();

        localStorage.clear();

        params = {
            post_logout_redirect_uri: BASE_URL
        };

        location.href = idaas.end_session_endpoint + '?' + encodeQueryData(params);
    });

    var bootstrap = function () {
        idaas = localStorage.getItem('idaas');
        resAuth = localStorage.getItem('resAuth');
        resUser = localStorage.getItem('resUser');

        idaas = JSON.parse(idaas);

        //Auth Endpoint
        procJson(resAuth, 'content_auth', true);

        if (resUser != '') {
            $('.hide-userinfo').show();
            //UserInfo Endpoint
            procJson(resUser, 'content_userinfo', false);
        } else {
            $('.hide-userinfo').hide();
        }

        //Uris
        $('#url_userinfo').text(idaas.userinfo_endpoint);
    };

    bootstrap();
});