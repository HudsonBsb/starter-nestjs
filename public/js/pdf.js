const TOKEN_KEY = 'X-TOKEN-BSBNUTRI';

document.addEventListener('DOMContentLoaded', async () => {
  $.get({
    url: '/api/categories?products=true',
    success: (categories) => {
      generateTable(categories);
    },
    beforeSend: function (request) {
      request.setRequestHeader(
        'Authorization',
        `Bearer ${CookieJS.get(TOKEN_KEY)}`,
      );
    },
  });
});

function generateTable(categories) {
  let left = 0;
  let right = 0;
  let side = 'left';
  let html = '';
  let htmlLeft = '';
  let htmlRight = '';
  categories.forEach((cat) => {
    if (!cat.products.length) return;
    side = side === 'left' && left >= right ? 'right' : 'left';
    html += '<table class="table-pdf">';
    html += `
                <thead>
                  <tr>
                    <th style="width: 62%">${cat.name}</th>
                    <th style="width: 20%">EMBALAGEM</th>
                    <th>R$/KG</th>
                    </tr>
                    </thead>
                    `;
    cat.products.forEach((prod) => {
      if (side === 'left') {
        left++;
      } else {
        right++;
      }
      let price = 0;
      if (prod.status === 'lacking') {
        price = 'em falta';
      } else if (prod.status === 'to_consult') {
        price = 'consultar';
      } else {
        price = (prod.price || 0)
          .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          .replace(/[^0-9.,]/g, '');
      }
      const updatedAt = new Date(prod.updatedAt).toLocaleDateString();
      const now = new Date().toLocaleDateString();
      let style = '';
      if (now === updatedAt) style = ' style="background-color: yellow;"';
      html += `
      <tbody>
      <tr${style}>
      <td>${prod.name}</td>
      <td>${prod.packaging}</td>
      <td>${price}</td>
      </tr>
      </tbody>
      `;
    });
    html += '</table>\n';
    if (side === 'left') {
      htmlLeft += html;
    } else {
      htmlRight += html;
    }
    html = '';
  });
  $('#left').html(htmlLeft);
  $('#right').html(htmlRight);
  $('.content').fadeIn();
  generatePdf();
}

async function generatePdf() {
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF('p', 'pt', 'letter');
  doc.setFont('helvetica');
  var body = document.querySelector('body');
  doc.setFontSize(5);
  margins = {
    top: 40,
    bottom: 60,
    left: 40,
    width: 522,
  };
  doc.html(body, {
    callback: function (doc) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
      ) {
        doc.output('dataurlnewwindow');
      } else {
        doc.save(
          'TABELA_' +
            new Date().toLocaleDateString().replace(/\D/g, '') +
            '.pdf',
        );
      }
      $('.content').fadeOut();
      $('.overlay').fadeIn();
      window.close();
    },
    x: 1,
    y: 1,
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
};
