// Full list of configuration options available here:
// https://github.com/hakimel/reveal.js#configuration
Reveal.initialize({
  controls: false,
  progress: true,
  history: false,
  center: true,
  //autoSlide: 5000,
  keyboard: true,
  //loop: true,

  theme: Reveal.getQueryHash().theme || 'night', // available themes are in /css/theme
  transition: Reveal.getQueryHash().transition || 'fade', // default/cube/page/concave/zoom/linear/fade/none
});

// set keyboard shortcuts
// note() logs each keyboard shortcut on our local log
KeyboardJS.on('q', function() { note('q'); checkIfDone(); steal(Reveal.getCurrentSlide()) }, null)    
KeyboardJS.on('w', function() { note('w'); checkIfDone(); reblog(Reveal.getCurrentSlide()) }, null)    
KeyboardJS.on('e', function() { note('e'); checkIfDone(); like(Reveal.getCurrentSlide()) }, null)    
KeyboardJS.on('j', function() { note('j'); checkIfDone(); Reveal.down() }, Reveal.up)    
KeyboardJS.on('h', function() { note('h'); }, null); 
KeyboardJS.on('l', function() { note('l'); checkIfDone() }, null); 


function reblog(slide) {

  // we will need the post id (in [0]) & reblog key (in [1])
  post_keys = getPostKeys(slide)
  
  // send keys as a post request
  $.post( "reblog", 
    {post_id: post_keys[0], reblog_key: post_keys[1]},
    function( data ) {
      console.log(data) 
    });

  // attach a sticker that shows the user reblogged it
  attachSticker('static/img/r.png', 'reblog', $(slide))

  // wait 250 ms before moving on 
  setTimeout(Reveal.right,250)

}

function like(slide) {
  
  // we will need the post id (in [0]) & reblog key (in [1])
  post_keys = getPostKeys(slide)
  
  // send keys as a post request
  $.post( "like", 
    {post_id: post_keys[0], reblog_key: post_keys[1]},
    function( data ) {
      //console.log(data) 
    }); 

  // get all the posts with the same ID as this one

  // attach a sticker that shows user likes it
  attachSticker('static/img/l.png', 'like', $(slide))
  
  // wait 250 ms before moving on 
  setTimeout(Reveal.right,250)

}

function steal(slide) {

  // get the photo url
  var photo_url = getPostPhoto(slide)

  // send url to photo as post request
  $.post( "steal", 
    {img: photo_url},
    function( data ) {
      console.log(data) 
    }); 


  // attach a sticker that shows the user stole it
  attachSticker('static/img/s.png', 'steal', $(slide))

  // wait 250 ms before moving on 
  setTimeout(Reveal.right,250)

}

function getPostKeys(slide) {

  // returns true if this is a meta slide
  if (slide.className.indexOf("meta") !== -1) {

    // if it is, we get reblog key from its id
    var reblog_key = slide.id

    // for post id, get display div
    var display = $('#'+reblog_key).siblings(".display")

    // get our post id from slide content
    var post_id = display.attr('id')

  }

  // if the current slide is display slide, 
  else if (slide.className.indexOf("display") !== -1) {

    //get post id from its id
    var post_id = slide.id

    //  the reblog key is in the meta div
    var meta = $('#'+post_id).next()

    var reblog_key = meta.attr('id')
  }

  return [post_id,reblog_key]
  

}

function getPostPhoto(slide) {

  // returns true if this is a meta slide
  if (slide.className.indexOf("meta") !== -1) {

    // make it a jquery object
    var meta = $(slide)

    // get the section with the photo in it 
    var display_slide = meta.parent().children('.display')

  // otherwise, if it's a display slide
  } else if (slide.className.indexOf("display") !== -1) {
    var display_slide = $(slide)
  }

  return display_slide.children()[0].src
}


// adds image to mainDisplay slide 
// type is the class of the div in which we place the sticker.
function attachSticker(img, type, section) {

  // if section is a meta slide
  if (section.attr('class').indexOf('meta') != -1) {
     // get the main slide
     var main_slide = section.prev()
     // go up to the main slide visually
     Reveal.up()
   }
  // otherwise
  else 
    // section is the main slide
    var main_slide = section


  //  if main_slide DOES NOT already has div of class
  if (main_slide.children('.'+type).html() == undefined) {
      // add sticker
      main_slide.append('<div class="'+type+'"><img src="'+img+'"></div>')
  }

}

var keylog = []

// adds char to memory, with timestamp
function note(char) {
  var d = new Date().getTime()
  keylog.push({key:char, time:d})
}


function checkIfDone() {

  if (Reveal.isLastSlide()) {

    console.log(JSON.stringify({log: keylog}))

   // post the json object to server
    $.ajax({
      type: 'POST',
      url: '/done',
      contentType: 'application/json',
      dataType:'json',
      data: JSON.stringify({log: keylog}),
      success: function(data) {
        console.log(data)
      }
    }) 
  }

}