compass-rose-ui
===============

Compass Rose UI is a javascript control for selecting
velocity and direction for wind and water.

It has been designed as a jquery plugin and as such can be easily
embedded anywhere(within reason) in an HTML document.

Here's what it looks like.

![Image of compass-rose-ui]
(https://raw.githubusercontent.com/NOAA-ORR-ERD/compass-rose-ui/master/ui_screenshot.png)

###So How do I Use it??###
The following is a quick illustration that should tell you pretty much everything
you need to know to put a compass-rose UI control into your web page.  It wouldn't
hurt though, to understand some of the fundamentals of jquery.

===

First, the .js source needs to be included in the head of the document.
Below is a snippet of what it might look like...
```
  <head>
    ...
    <script src="/static/js/compass-rose-ui.min.js"></script>
    ...
  </head>

```
The URL for the source file will likely change depending on where you
decide to locate it.  The above example assumes it is located on the same
webserver that is serving the web page.

===
Next, you can optionally set some styles for the control...
```
    <style type="text/css" >
      ...

      #const-wind-1 {
        width: 300px;
        height: 300px;
        position: relative;
      }

      ...
    </style>
```
Here, we are setting the style for an instance of our ui called **'const-wind-1'**.

===
The next thing to do is define an instance of our compass-rose-ui.
This is done in kinda the standard way you would invoke any jquery-ui control...

```
  <script type="text/javascript" >
    window.onload = function() {
      ...

      $('#const-wind-1').compassUI({
        'arrow-direction': 'in',
        'move': function( magnitude, direction ) {
          $( "#const-wind-speed" ).val(magnitude.toFixed(2));
          $( "#const-wind-dir" ).val(direction.toFixed(2));
          $( "#const-wind-cdir" ).val( this["cardinal-name"](direction));
        },
        'change': function( magnitude, direction ) {
          $('#wind-directions').find('tbody:last').empty();
          $('#wind-directions').find('tbody:last').append(
            '<tr>' +
            '<td>' + '</td>' +
            '<td>' + '</td>' +
            '<td>' + $( '#const-wind-speed' ).val() + ' ' + $( '#const-wind-speed-units' ).val() + '</td>' +
            '<td>' + $( '#const-wind-dir' ).val() + '</td>' +
            '<td>' + $( '#const-wind-cdir' ).val() + '</td>' +
            '</tr>'
          );
        },
      });

      ...
    };

  </script>
```
It is a good idea to do this after the window is rendered.
Here, we do this by defining it inside window.onload.
A couple things to notice about this definition:
- **'arrow-direction'** is visually the direction the arrow is pointing on the compass
- **'move'** is the function that is invoked when the arrow is 'dragged'.  You can define
  this function to do just about anything with the magnitude and direction args.
- **'change'** is similar to move, but it is invoked when an arrow move operation is completed.
  *(i.e. the arrow is dragged and then released)*.

===
####Optional####
There are a couple of convenience functions built-in to each compass control that are used
to convert angular direction values into their associated cardinal direction and vice versa.

Here is a short snippet that illustrates these functions...
```
  <script type="text/javascript" >
    ...

    var cardinal_value = 'ne';  // for example

    var angle = $('#const-wind-1')[0].settings['cardinal-angle'](cardinal_value);
    DoSomethingWithTheAngle(angle);

    var direction_value = 45.0;  // for example

    var cardinal = $('#const-wind-1')[0].settings['cardinal-name'](direction_value);
    DoSomethingWithTheCardinal(cardinal);

    ...
  </script>
```

===
####Finally####
The last thing to do now is put it into the body of your web page.
The way to do that is simply define a `<div>` tag with the id of the instance you defined. 
```
  <div id="const-wind-1">
  </div>
```
