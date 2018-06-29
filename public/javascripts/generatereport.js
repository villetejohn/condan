$(function() {

  var pdf = new jsPDF();
  pdf.setFontSize(10);

  //       x   y
  // doc.text(20, 10, 'Incident');
  // doc.text(40, 10, 'Author');
  // doc.text(40, 10, 'Location');
  // doc.text(50, 10, 'Status');
  // doc.text(60, 10, 'Report Created');

  // Block Template Report
  var initPoint = 20;
  var rowInc = 15;
  var rowTitle = 10;
  var rowContent = 15;
  var fields = ['Incident', 'Author', 'Location', 'Status', 'Date Created'];

  for (let x = 0; x < fields.length; x++) {
  
    pdf.text(initPoint, rowTitle, `${fields[x]}`);
    pdf.text(initPoint, rowContent, '{{' + `${fields[x]}` + '}}');

    rowTitle += rowInc;
    rowContent += rowInc;
  }


  // Summary Template Report
  /*
    Total Number of Reports
    Total Number of Issues - Resolved | Pending

  */

  pdf.output('datauri');
  pdf.save('Incident Reports.pdf');


});