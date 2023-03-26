const TOKEN_KEY = 'X-TOKEN-BSBNUTRI';

$(document).ready(() => {
  $.ajaxSetup({
    beforeSend: function (xhr) {
      if (CookieJS.check(TOKEN_KEY))
        xhr.setRequestHeader(
          'Authorization',
          `Bearer ${CookieJS.get(TOKEN_KEY)}`,
        );
    },
    complete: function (xhr) {
      if (
        location.pathname !== '/login' &&
        (xhr.status === 401 || xhr.status === 403)
      )
        location.href = '/login';
      hideBtnLoading();
    },
  });

  $('#submit').on('click', (e) => {
    showBtnLoading();
    e.preventDefault();

    const data = $('form')
      .serializeArray()
      .map((o) => ({ [o.name]: o.value }))
      .reduce((a, b) => Object.assign({}, a, b));

    $.post({
      url: '/api/login',
      data,
      success: ({ accessToken }) => {
        CookieJS.set(TOKEN_KEY, accessToken);
        location.href = '/';
      },
      error: ({ responseJSON } = err) => alert(responseJSON.message, 'error'),
    });
  });
});

function showBtnLoading() {
  $('#submit').val('Aguarde...');
  $('#submit').prop('disabled', true);
}

function hideBtnLoading() {
  $('#submit').val('Logar');
  $('#submit').prop('disabled', false);
}

function alert(text, icon = 'success') {
  Sweetalert2.fire({
    title: icon === 'error' ? 'Oops!' : 'Ótimo!',
    text,
    icon,
    confirmButtonColor: '#00ad28',
  });
}

const CookieJS = {
  get: function (c_name) {
    if (document.cookie.length > 0) {
      var c_start = document.cookie.indexOf(c_name + '=');
      if (c_start != -1) {
        c_start = c_start + c_name.length + 1;
        var c_end = document.cookie.indexOf(';', c_start);
        if (c_end == -1) {
          c_end = document.cookie.length;
        }
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return '';
  },
  set: function (c_name, value) {
    var exdate = new Date();
    exdate.setHours(exdate.getHours() + 2);
    document.cookie =
      c_name + '=' + escape(value) + '; expires=' + exdate.toUTCString();
  },
  check: function (c_name) {
    return !!CookieJS.get(c_name);
  },
};
