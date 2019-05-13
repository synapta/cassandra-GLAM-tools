$(document).ready(function() {
  $.get('/api/glams', function (glams) {
    var photos = $('#photos');
    if (glams.length > 0) {
      $.get('/views/templates/glam-homepage.tpl', function(tpl) {
        var template = Handlebars.compile(tpl);
        glams.forEach(function (glam, idx) {
          let obj = {};
          obj.url = '/' + glam['name'];
          obj.category = glam['category'];
          obj.image_url = glam['image'];
          obj.title = glam['fullname'];

          // photos.append(template(obj));

          // var a = $('<a>');
          // a.attr('href', '/' + glam['name']);
          // a.attr('alt', glam['category']);
          // photos.append(a);
          //
          // var container = $('<div>');
          // container.attr('class', 'container');
          // a.append(container);
          //
          // var img = $('<img>');
          // img.attr('src', glam['image']);
          // container.append(img);
          //
          // var block = $('<div>');
          // block.attr('class', 'text-block');
          // container.append(block);
          //
          // var h4 = $('<h4>');
          // h4.text(glam['fullname']);
          // block.append(h4);

          switch (idx % 3) {
            case 0:
              // console.log(idx, ' first col');
              $('#photos-1').append(template(obj));
              break;
            case 1:
              // console.log(idx, ' snd col');
              $('#photos-2').append(template(obj));
              break;
            case 2:
              // console.log(idx, ' thirs col');
              $('#photos-3').append(template(obj));
              break;
          }
        });
      });
    } else {
      console.log('no glams');
    }
  });
});
