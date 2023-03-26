const TOKEN_KEY = 'X-TOKEN-BSBNUTRI';
let dataTable;
let TOKEN;
let rowSelected;

document.addEventListener('DOMContentLoaded', async () => {
  $('#accordionModal').on('show.bs.collapse', function (e) {
    $('#btnSaveProduct').removeAttr('onclick');
    $('#btnSaveProduct').attr(
      'onClick',
      e.target.id === 'category' ? 'saveCategory()' : 'saveProduct()',
    );
  });

  $('.currency').maskMoney({
    prefix: 'R$ ',
    allowNegative: true,
    thousands: '.',
    decimal: ',',
    affixesStay: true,
  });

  $('.kg').maskMoney({
    suffix: 'KG',
    allowNegative: false,
    thousands: '',
    decimal: '.',
    affixesStay: true,
  });

  TOKEN = CookieJS.get(TOKEN_KEY);
  dataTable = $('#products').DataTable({
    processing: true,
    ordering: {},
    drawCallback: listenerBtnDelete,
    ajax: {
      method: 'GET',
      url: '/api/products',
      beforeSend: function (request) {
        request.setRequestHeader('Authorization', `Bearer ${TOKEN}`);
      },
      dataSrc: (o) => o,
    },
    order: [[4, 'desc']],
    columns: [
      { data: 'name' },
      {
        data: (o) =>
          (o.price || 0)
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            .replace(/[^0-9.,]/g, ''),
      },
      { data: (o) => o.packaging + 'KG' },
      { data: 'category.name' },
      {
        data: {
          _: (o) => {
            return new Date(o.updatedAt).toLocaleDateString();
          },
          sort: (o) => new Date(o.updatedAt).getTime(),
        },
      },
      {
        data: ({ _id, name, price, packaging, category }) => `
      <div style="text-align: center;">
      <button onclick="editModal(this.value)" value='${JSON.stringify({
        _id,
        name,
        price,
        packaging,
        category,
      })}' type="button" style="border-radius: 50% !important" class="btn btn-primary btn-sm rounded btn-action">
        <i class="fa fa-edit"></i>
      </button>&nbsp;
      <button onclick="deleteProduct(this.value)" value='${JSON.stringify({
        _id,
        name,
      })}' type="button" style="border-radius: 50% !important" class="btn btn-danger btn-sm rounded btn-action">
        <i class="fa fa-trash"></i>
      </button>
      </div>
      `,
      },
    ],
    language: {
      infoEmpty:
        '<button data-toggle="modal" data-target="#productModal" class="btn btn-secondary float-left">Adicionar</button> &nbsp;' +
        '<button onclick="pdfGenerate()" id="pdf-generate" class="btn btn-dark float-left">PDF</button>',
      info:
        '<button data-toggle="modal" data-target="#productModal" class="btn btn-secondary float-left">Adicionar</button> &nbsp;' +
        '<button onclick="pdfGenerate()" id="pdf-generate" class="btn btn-dark float-left">PDF</button>',
      search: '',
      searchPlaceholder: 'Buscar',
      processing: 'Aguarde...',
      zeroRecords: 'Sem produtos',
      infoFiltered: '',
      lengthMenu: 'Mostrar _MENU_ produtos por página',
      paginate: {
        previous: 'Anterior',
        next: 'Próximo',
      },
    },
  });

  $.get({
    url: '/api/categories',
    success: (categories) => {
      categories.forEach((cat) => {
        $('.categories').append(
          `<option value="${cat._id}">${cat.name}</option>`,
        );
      });
    },
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', `Bearer ${TOKEN}`);
    },
  });
  $('#products_wrapper').addClass('w-100');

  $.ajaxSetup({
    complete: function (xhr) {
      if (
        location.pathname !== '/login' &&
        (xhr.status === 401 || xhr.status === 403)
      )
        location.href = '/login';
    },
  });
});

function showBtnLoading() {
  $('.btnProduct').text('Aguarde...');
  $('.btnProduct').prop('disabled', true);
}

function hideBtnLoading() {
  $('.btnProduct').text('Salvar');
  $('.btnProduct').prop('disabled', false);
}

function alert(text, icon = 'success') {
  Sweetalert2.fire({
    title: icon === 'error' ? 'Oops!' : 'Ótimo!',
    text,
    icon,
    confirmButtonColor: '#00ad28',
  });
}

function saveProduct() {
  const data = $('#formProduct')
    .serializeArray()
    .map((o) => ({ [o.name]: o.value }))
    .reduce((a, b) => Object.assign({}, a, b));

  if (!Object.values(data).every((o) => o) || !$('#categories').val()) {
    alert('Preencha todos os campos.', 'error');
    return false;
  }

  showBtnLoading();

  data['category'] = { id: $('#categories').val() };
  data['price'] = Number(
    data['price'].replace(/\D/g, '').replace(/(\d+)(\d{2})/g, '$1.$2'),
  );
  data['packaging'] = Number(
    data['packaging'].replace(/\D/g, '').replace(/(\d+)(\d{2})/g, '$1.$2'),
  );

  $.post({
    url: '/api/products',
    data,
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', `Bearer ${TOKEN}`);
    },
    success: ({ name, price, packaging, category, updatedAt }) => {
      $('#productModal').modal('hide');
      $('#formProduct')[0].reset();
      dataTable.row
        .add({
          name,
          price,
          packaging,
          category,
          updatedAt,
        })
        .draw(false);
    },
    complete: hideBtnLoading,
    error: ({ responseJSON } = err) => alert(responseJSON.message, 'error'),
  });
}

function saveCategory() {
  const data = $('#formCategory')
    .serializeArray()
    .map((o) => ({ [o.name]: o.value }))
    .reduce((a, b) => Object.assign({}, a, b));

  if (!Object.values(data).every((o) => o)) {
    alert('Preencha todos os campos.', 'error');
    return false;
  }

  showBtnLoading();

  $.post({
    url: '/api/categories',
    data,
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', `Bearer ${TOKEN}`);
    },
    success: ({ name, _id }) => {
      $('#productModal').modal('hide');
      $('#formCategory')[0].reset();
      $('.categories').append(`<option value="${_id}">${name}</option>`);
    },
    complete: hideBtnLoading,
    error: ({ responseJSON } = err) => alert(responseJSON.message, 'error'),
  });
}

function deleteProduct(str) {
  const { _id, name } = JSON.parse(str);
  Swal.fire({
    title: 'Deseja mesmo excluir produto?',
    text: name,
    showCancelButton: true,
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const TOKEN = CookieJS.get(TOKEN_KEY);
      return fetch(`/api/products/${_id}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        method: 'DELETE',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .catch((error) => {
          Swal.showValidationMessage(`Requisição falhou: ${error}`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      rowSelected.remove().draw();
      Swal.fire('Ótimo!', 'Produto excluído com sucesso.', 'success');
    }
  });
}

function listenerBtnDelete() {
  $('.btn-action').on('click', (e) => {
    rowSelected = dataTable.row($(e.target).parents('tr'));
  });
}

function editModal(str) {
  const { _id, name, price, packaging, category, updatedAt } = JSON.parse(str);
  $('#formProductUpdate #_idUpdate').val(_id);
  $('#formProductUpdate #nameUpdate').val(name);
  $('#formProductUpdate #priceUpdate').val(
    (price || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
  );
  $('#formProductUpdate #packagingUpdate').val(
    (packaging || 0)
      .toFixed(2)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      .replace(/[^0-9.]/g, '') + 'KG',
  );
  $('#formProductUpdate #categoriesUpdate').val(category._id);
  $('#formProductUpdate #updatedAtUpdate').val(updatedAt);
  $('#updateProductModal').modal('show');
}

function updateProduct() {
  const data = $('#formProductUpdate')
    .serializeArray()
    .map((o) => ({ [o.name]: o.value }))
    .reduce((a, b) => Object.assign({}, a, b));

  if (!Object.values(data).every((o) => o)) {
    alert('Preencha todos os campos.', 'error');
    return false;
  }

  showBtnLoading();

  data['price'] = Number(
    data['price'].replace(/\D/g, '').replace(/(\d+)(\d{2})/g, '$1.$2'),
  );
  data['packaging'] = Number(
    data['packaging'].replace(/\D/g, '').replace(/(\d+)(\d{2})/g, '$1.$2'),
  );

  $.ajax({
    method: 'PUT',
    url: '/api/products',
    data,
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', `Bearer ${TOKEN}`);
    },
    success: ({ name, price, packaging, updatedAt }) => {
      $('#updateProductModal').modal('hide');
      $('#formProduct')[0].reset();
      dataTable
        .row(rowSelected[0])
        .data({
          name,
          price,
          packaging,
          category: { name: $('#categoriesUpdate option:selected').html() },
          updatedAt,
        })
        .draw(false);
    },
    complete: hideBtnLoading,
    error: ({ responseJSON } = err) => alert(responseJSON.message, 'error'),
  });
}

function pdfGenerate() {
  window.open('/pdf', '_blank');
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
};
