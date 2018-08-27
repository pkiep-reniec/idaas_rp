var popup = null;
var timer = null;
var timerClose = null;
var params = {};
var idaas = {};
var authComplete = false;
var baseUrlService = null;

$(document).ready(function () {
    var ops = [];

    $('#op').change(function () {
        var id = parseInt($(this).val());
        var dataSelected = {};

        $('.clean-data').val('');
        $('#save').prop('checked', false);

        if (id == 0) {
            $('.clean-data').prop('disabled', false);
            $('#url').focus();
        } else {
            for (i = 0; i < ops.length; i++) {
                if (ops[i].id == id) {
                    dataSelected = ops[i];
                    break;
                }
            }

            $('#url').val(dataSelected.url);
            $('#client_id').val(dataSelected.client_id);
            $('#client_secret').val(dataSelected.client_secret);
            $('#redirect_uri').val(dataSelected.redirect_uri);
        }
    });

    $('#form').submit(function (e) {
        e.preventDefault();
        loading(true);

        if ($('#response_id_token').is(':checked') || $('#response_token').is(':checked')) {
            popupCenter(idaasUrl, 'RENIEC IDaaS', 400, 600);

            discover(function (response) {
                procAuth(response);
            });
        } else {
            var data = $(this).serialize();

            $.post(BASE_URL + '/auth', data, function (response) {
                location.href = response.url;
            });
        }
    });

    var bootstrap = function () {
        if (data != '') {
            ops = atob(data);
            ops = JSON.parse(ops);
        }
    };

    bootstrap();
});

function procResult(data) {
    clearInterval(timer);
    popup.close();

    resAuth = parseHashParams(data);

    if (resAuth != undefined) {
        if (resAuth.error == undefined) {
            if (params.state == resAuth.state) {
                if (resAuth.access_token != undefined) {
                    procUserinfo(resAuth.access_token, function (response) {
                        localStorage.setItem('idaas', JSON.stringify(idaas));
                        localStorage.setItem('resAuth', JSON.stringify(resAuth));
                        localStorage.setItem('resUser', JSON.stringify(response));

                        location.href = BASE_URL + '/info-implicit';
                    });
                } else {
                    localStorage.setItem('idaas', JSON.stringify(idaas));
                    localStorage.setItem('resAuth', JSON.stringify(resAuth));
                    localStorage.setItem('resUser', '');

                    location.href = BASE_URL + '/info-implicit';
                }
            } else {
                alert('state not match');
            }
        } else {
            alert(resAuth.error_description.replaceAll('+', ' '));
        }
    } else {
        alert('response is undefined');
    }

    loading(false);
}

function procUserinfo(token, callback) {
    $.ajax({
        type: 'POST',
        url: idaas.userinfo_endpoint,
        data: {
            access_token: token
        }
    }).done(function (response) {
        callback(response);
    }).fail(function (err) {
        alert('Ha ocurrido un error');
        console.log(err);
    });
}

function procAuth(response) {
    idaas = response;
    params = buildAuthRequest();
    url = idaas.authorization_endpoint + '?' + encodeQueryData(params);
    popup.location.href = url;

    timer = setInterval(function () {
        if (popup.location.href.indexOf(baseUrlService) === -1) {
            authComplete = true;
            procResult(popup.location.hash);
        }
    }, 100);

    timerClose = setInterval(function () {
        if (popup.closed) {
            clearInterval(timer);
            clearInterval(timerClose);

            if (!authComplete) {
                alert('User has cancelled auth process.');
                loading(false);
            }
        }
    }, 100);
}

function discover(callback) {
    url = $('#url').val();

    //webfinger
    $.ajax({
        url: url + '/.well-known/webfinger',
        method: 'GET',
        data: {
            resource: url,
            rel: 'http://openid.net/specs/connect/1.0/issuer'
        }
    }).done(function (response) {
        //openid config
        $.ajax({
            url: response.links.href + '/.well-known/openid-configuration',
            method: 'GET',
        }).done(function (response) {
            console.log(response);
            baseUrlService = response.issuer;
            callback(response);
        }).fail(function (err) {
            alert('Ha ocurrido un error');
            popup.close();
            console.log(err);
        });
    }).fail(function (err) {
        alert('Ha ocurrido un error');
        popup.close();
        console.log(err);
    });
}

function buildAuthRequest() {
    params = {
        response_type: '',
        client_id: $('#client_id').val(),
        redirect_uri: $('#redirect_uri').val(),
        state: Date.now() + '' + Math.random(),
        nonce: 'N' + Math.random() + '' + Date.now(),
        scope: '',
        prompt: '',
        acr_values: $('input[name=acr_value]:checked').val()
    };
    scopes = ['openid'];
    responseTypes = [];
    prompts = [];

    //Max Age
    if (!isNaN($('#max_age').val())) {
        params.max_age = $('#max_age').val();
    }

    //Login hint
    if ($('#login_hint').val()) {
        params.login_hint = $('#login_hint').val();
    }

    //Scopes
    if ($('#scope_profile').is(':checked')) {
        scopes.push('profile');
    }

    if ($('#scope_email').is(':checked')) {
        scopes.push('email');
    }

    if ($('#scope_address').is(':checked')) {
        scopes.push('address');
    }

    if ($('#scope_phone').is(':checked')) {
        scopes.push('phone');
    }

    if ($('#scope_birthdate').is(':checked')) {
        scopes.push('birthdate');
    }

    if ($('#scope_offline_access').is(':checked')) {
        scopes.push('offline_access');
    }

    //Response type
    if ($('#response_code').is(':checked')) {
        responseTypes.push('code');
    }

    if ($('#response_id_token').is(':checked')) {
        responseTypes.push('id_token');
    }

    if ($('#response_token').is(':checked')) {
        responseTypes.push('token');
    }

    //Prompts
    if ($('#prompt_none').is(':checked')) {
        prompts.push('none');
    }

    if ($('#prompt_login').is(':checked')) {
        prompts.push('login');
    }

    if ($('#prompt_consent').is(':checked')) {
        prompts.push('consent');
    }

    params.scope = scopes.join(' ');
    params.response_type = responseTypes.join(' ');
    params.prompt = prompts.join(' ');

    return params;
}

function popupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    popup = window.open(url, title, 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no,width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        popup.focus();
    }
}

function parseHashParams(hash) {
    hash = hash.substring(1);
    params = {};

    hash.split('&').map(hk => {
        let temp = hk.split('=');
        params[temp[0]] = temp[1];
    });

    return params;
}

function loading(loading) {
    if (loading) {
        $('#btnSubmit').prop('disabled', true);
    } else {
        $('#btnSubmit').prop('disabled', false);
    }
}