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
  let category;
  const half =
    categories.reduce((sum, obj) => sum + (obj.products || []).length, 0) / 2;
  let left = true;
  let count = 0;
  let html = '';
  let htmlLeft = '';
  let htmlRight = '';
  categories.forEach((cat, key) => {
    if (!cat.products.length) return;
    html += '<table class="table-pdf">';
    html += `
                <thead>
                  <tr>
                    <th style="width: 62%">${cat.name}</th>
                    <th style="width: 20%">EMBALAGEM</th>
                    <th>R$/KG</th>
                    </tr>
                    </thead>
                    <tbody>
                    `;
    cat.products.forEach((prod) => {
      count++;
      if (count > half) {
        left = false;
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
      <tr${style}>
      <td>${prod.name}</td>
      <td>${prod.packaging}</td>
      <td>${price}</td>
      </tr>
      `;
    });
    html += `</tbody>
              </table>\n`;
    if (left) {
      htmlLeft += html;
    } else {
      htmlRight += html;
    }
    html = '';
  });
  $('#left').html(htmlLeft);
  $('#right').html(htmlRight);
  $('.content').fadeIn();
  $('.overlay').fadeOut();
  generatePdf();
}

async function generatePdf() {
  const { jsPDF } = window.jspdf;
  var doc = new jsPDF('p', 'pt', 'letter');
  doc.setFont('helvetica');
  var body = document.querySelector('body');
  doc.setFontSize(5);

  pageHeight = doc.internal.pageSize.height;

  // doc.addPage(612, 791);

  doc.html(body, {
    margin: [5.6, 0, 5.6, 0],
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
