/**
 * Created by Miguel Pazo (https://miguelpazo.com)
 */

var timer = null;
var params = {};

$(document).ready(function () {
    $('#form').submit(function (e) {
        e.preventDefault();

        if ($('#response_id_token').is(':checked') || $('#response_token').is(':checked')) {
            var params = filterParams();
            var paramsFinal = $.extend(params, {
                clientId: CLIENT_ID
            });

            ReniecIDaaS.init(paramsFinal);

            ReniecIDaaS.onLoad(function () {
                loading(true);
            });

            ReniecIDaaS.onCancel(function () {
                loading(false);
            });

            ReniecIDaaS.onSuccess(function (response) {
                localStorage.setItem('authResponse', JSON.stringify(response));
                location.href = BASE_URL + '/info-implicit';
            });

            ReniecIDaaS.auth();
        } else {
            loading(true);
            
            var data = $(this).serialize();

            $.get(BASE_URL + '/auth', data, function (response) {
                location.href = response.url;
            });
        }
    });
});

function filterParams() {
    var params = {
        scopes: [],
        acr: $('input[name=acr_value]:checked').val(),
        prompts: [],
        responseTypes: [],
        maxAge: null,
        loginHint: null
    };

    //Max Age
    if (!isNaN($('#max_age').val())) {
        params.maxAge = $('#max_age').val();
    }

    //Login hint
    if ($('#login_hint').val()) {
        params.loginHint = $('#login_hint').val();
    }

    //Scopes
    if ($('#scope_profile').is(':checked')) {
        params.scopes.push(ReniecIdaasConst.SCOPE_PROFILE);
    }

    if ($('#scope_email').is(':checked')) {
        params.scopes.push(ReniecIdaasConst.SCOPE_EMAIL);
    }

    if ($('#scope_phone').is(':checked')) {
        params.scopes.push(ReniecIdaasConst.SCOPE_PHONE);
    }

    if ($('#scope_offline_access').is(':checked')) {
        params.scopes.push(ReniecIdaasConst.SCOPE_OFFLINE_ACCESS);
    }

    //Response type
    if ($('#response_code').is(':checked')) {
        params.responseTypes.push(ReniecIdaasConst.RESPONSE_TYPE_CODE);
    }

    if ($('#response_id_token').is(':checked')) {
        params.responseTypes.push(ReniecIdaasConst.RESPONSE_TYPE_ID_TOKEN);
    }

    if ($('#response_token').is(':checked')) {
        params.responseTypes.push(ReniecIdaasConst.RESPONSE_TYPE_TOKEN);
    }

    //Prompts
    if ($('#prompt_none').is(':checked')) {
        params.prompts.push(ReniecIdaasConst.PROMPT_NONE);
    }

    if ($('#prompt_login').is(':checked')) {
        params.prompts.push(ReniecIdaasConst.PROMPT_LOGIN);
    }

    if ($('#prompt_consent').is(':checked')) {
        params.prompts.push(ReniecIdaasConst.PROMPT_CONSENT);
    }

    return params;
}

function loading(loading) {
    if (loading) {
        $('#btnSubmit').prop('disabled', true);
    } else {
        $('#btnSubmit').prop('disabled', false);
    }
}