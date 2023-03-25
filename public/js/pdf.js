const TOKEN_KEY = 'X-TOKEN-BSBNUTRI';

document.addEventListener('DOMContentLoaded', async () => {
  const TOKEN = (await cookieStore.get(TOKEN_KEY)).value;
  $.get({
    url: '/api/categories?products=true',
    success: (categories) => {
      generateTable(categories);
    },
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', `Bearer ${TOKEN}`);
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
    side = side === 'left' && left >= right ? 'right' : 'left';
    html += '<table class="table-pdf">';
    html += `
                <thead>
                  <tr>
                    <th style="width: 66%">${cat.name}</th>
                    <th style="width: 22%">EMBALAGEM</th>
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
      const price = (prod.price || 0).toLocaleString();
      const updatedAt = new Date(prod.updatedAt).toLocaleDateString();
      const now = new Date().toLocaleDateString();
      let style = '';
      if (now === updatedAt) style = ' style="background-color: yellow;"';
      html += `
      <tbody>
      <tr${style}>
      <td>${prod.name}</td>
                          <td>${prod.packaging}KG</td>
                          <td>${
                            /[.]/g.test(prod.price) ? price : price + ',00'
                          }</td>
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
      doc.save(
        'TABELA_' + new Date().toLocaleDateString().replace(/\D/g, '') + '.pdf',
      );
      $('.content').fadeOut();
      $('.overlay').fadeIn();
      window.close();
    },
    x: 1,
    y: 1,
  });
}
