$(function() {
    $(document).ready(function(){

      switch (window.location.pathname) {
        case '/dashboard/view-reports':
          $("#table-filter").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#incidents-table-body tr").filter(function() {
              $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
          });
          break;

        case '/dashboard/accounts' :
          $("#table-filter").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#users-table-body tr").filter(function() {
              $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
          });
          break;

        case '/dashboard/home' :
          $("#table-filter").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#announcement-body section").filter(function() {
              $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
          });
          break;
      }

    });
});
