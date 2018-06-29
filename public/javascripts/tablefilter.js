$(function() {
    $(document).ready(function(){
      $("#incidents-table-filter").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#incidents-table-body tr").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
    });
});
