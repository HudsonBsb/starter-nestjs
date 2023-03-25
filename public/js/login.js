const TOKEN_KEY = 'X-TOKEN-BSBNUTRI';

$(document).ready(() => {
  $.ajaxSetup({
    beforeSend: function (xhr) {
      if (cookieStore.get(TOKEN_KEY))
        xhr.setRequestHeader(
          'Authorization',
          `Bearer ${cookieStore.get(TOKEN_KEY)}`,
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
        cookieStore.set(TOKEN_KEY, accessToken);
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
