$(function() {
  $.get('http://localhost:3000/api/booked-amenities', function(results) {
      $('#calendar').fullCalendar({
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay'
        },
        selectable: true,
        eventLimit: true,
        events: results.bookingDetails
      });
  })




});


