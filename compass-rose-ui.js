/*
 *  Compass Rose UI - a javascript control for selecting velocity and direction
 *               for wind and water.
 */


(function( $ ) {
    $.fn.compassRoseUI = function(options, arg) {

        return this.each(function() {
            var _this = this;

            // Public API methods

            // clear the front canvas (arrow and line shapes)
            if (options === 'reset') {
              this.resetCanvas();
              return;
            }

            // update the plugin properties
            if (options === 'update') {
                if (!this.frontcanv) {
                    return;
                }

                this.resetCanvas();

                var newDirection = parseInt(arg.direction);
                var newSpeed = parseInt(arg.speed);
                var coordinates = this.flipXY(this.polarToCartesian(newDirection, newSpeed));

                coordinates.x *= this.frontcanv.px_per_unit;
                coordinates.y *= -this.frontcanv.px_per_unit;

                coordinates.x += this.frontcanv.width / 2;
                coordinates.y += this.frontcanv.height / 2;

                _this.drawArrow(coordinates);
                if(this.frontcanv.parentElement.settings.move && arg.trigger_move === true){
                    this.frontcanv.parentElement.settings['move'](newSpeed, newDirection);
                }
                return;
            }

            this.settings = $.extend( {
                'arrow-direction' : 'out',
                // we can optionally set a function which translates the angle to its nearest cardinal value
                'cardinal-name' : function(angle) {
                    var dirNames = ['N', 'NNE', 'NE', 'ENE',
                                  'E', 'ESE', 'SE', 'SSE',
                                  'S', 'SSW', 'SW', 'WSW',
                                  'W', 'WNW', 'NW', 'NNW'];
                    return dirNames[Math.floor((+(angle) + 360 / 32) / (360 / 16.0) % 16)];
                },
                // we can optionally set a function which translates the cardinal direction to its angle
                'cardinal-angle' : function(name) {
                    var dirNames = ['N', 'NNE', 'NE', 'ENE',
                                  'E', 'ESE', 'SE', 'SSE',
                                  'S', 'SSW', 'SW', 'WSW',
                                  'W', 'WNW', 'NW', 'NNW'];
                    var idx = dirNames.indexOf(name.toUpperCase());
                    if (idx === -1) {
                        return null;
                    } else {
                        return (360.0 / 16) * idx;
                    }
                },
                // we can optionally set a function which happens on a move
                'move' : null,
                // we can optionally set a function which happens after a mouse drag
                'change' : null,
            }, options);

            this.resetCanvas = function() {
                if (!this.frontcanv) {
                    return;
                }

                this.frontcanv.getContext('2d').clearRect(
                  0, 0, this.frontcanv.width, this.frontcanv.height);
            };

            this.polarToCartesian = function(angle, magnitude) {
                var radians = angle * Math.PI / 180;
                return {
                    x: magnitude * Math.cos(radians),
                    y: magnitude * Math.sin(radians)
                };
            };

            this.cartesianToPolar = function(x, y) {
                return {
                    magnitude: Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                    angle: Math.atan2(x, y) * 180 / Math.PI
                };
            };

            this.flipXY = function(coords) {
                var tmp = coords.x;
                coords.x = coords.y;
                coords.y = tmp;
                
                return coords;
            };

            this.getMousePosition = function(ev){
                // XXX: Do these values get used?
                var coordinates;
                var offset = $(this.frontcanv).offset();
                if (ev.originalEvent['layerX'] != undefined) {
                     coordinates = {
                        x: ev.originalEvent.pageX - offset.left,
                        y: ev.originalEvent.pageY - offset.top
                    };
                } else {
                    // in IE, we use this property
                    coordinates = {
                        x: ev.originalEvent.x,
                        y: ev.originalEvent.y
                    };
                }
                return coordinates;
            };

            this.checkPath = function(ctx, coords, path){
                return ctx.isPointInPath(path, coords.x, coords.y);
            };

            this.drawArrow = function(coords) {
                var canvas = this.frontcanv;
                var ctx = canvas.getContext('2d');

                var xmag = (coords.x - canvas.width / 2);
                var ymag = -(coords.y - canvas.height / 2);

                canvas.pmag = Math.sqrt(Math.pow(xmag, 2) + Math.pow(ymag, 2));
                canvas.pmag /= canvas.px_per_unit;
                var temp = canvas.pmag;
                // Capping maximum magnitude of speed vector to 30
                (canvas.pmag > 30) ? canvas.pmag = 30 : canvas.pmag;

                // Convert degrees to radians
                canvas.pangle = Math.atan2(xmag, ymag) * 180 / Math.PI;
                if (canvas.pangle < 0) {
                    canvas.pangle += 360;
                }
                if (temp > 30) {
                    coords = this.flipXY(this.polarToCartesian(canvas.pangle, 30));
                    coords.y = -coords.y;
                    coords.x *= canvas.px_per_unit;
                    coords.y *= canvas.px_per_unit;
                    coords.x += canvas.width / 2;
                    coords.y += canvas.height / 2;
                }

                // draw a line from the center
                ctx.lineWidth = 2;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2);
                ctx.lineTo(coords.x, coords.y);
                ctx.stroke();
                ctx.closePath();

                // draw our arrow point
                ctx.beginPath();
                if (canvas.parentElement.settings &&
                    canvas.parentElement.settings['arrow-direction'] === 'in')
                {
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate((canvas.pangle + 180) * Math.PI / 180);
                } else {
                    ctx.translate(coords.x, coords.y);
                    ctx.rotate(canvas.pangle * Math.PI / 180);
                }
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(0, 8, 8, 15);
                ctx.lineTo(0, 8);
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(0, 8, -8, 15);
                ctx.lineTo(0, 8);
                ctx.stroke();
                ctx.closePath();

                if (canvas.parentElement.settings &&
                    canvas.parentElement.settings['arrow-direction'] === 'in')
                {
                    ctx.rotate(-(canvas.pangle + 180) * Math.PI / 180);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);
                } else {
                    ctx.rotate(-canvas.pangle * Math.PI / 180);
                    ctx.translate(-coords.x, -coords.y);
                }
                ctx.beginPath();
                ctx.closePath();
            };

            $(this).load(function(ev) {
                var event = ev;
            });

            // check if our object is hidden
            $(this).css({'visibility':'hidden', 'display':'block'});


            // here we create our background canvas
            if (this['backcanv'] === undefined) {
                $(this).append('<canvas id="' + this.id + '-back"></canvas>');
                this.backcanv = $('canvas#' + this.id + '-back')[0];
                if (window['G_vmlCanvasManager'] != undefined) {
                    // older versions of IE don't natively have canvas functionality
                    G_vmlCanvasManager.initElement(this.backcanv);
                }
            }

            var backcanv = this.backcanv;
            backcanv.width = $(this).width();
            backcanv.height = $(this).height();
            backcanv.style.zIndex = "0";
            backcanv.style.position = 'absolute';

            // here we create our foreground canvas
            if (this['frontcanv'] === undefined) {
                $(this).append('<canvas id="' + this.id + '-front"></canvas>');
                this.frontcanv = $('canvas#' + this.id + '-front')[0];
                if (window['G_vmlCanvasManager'] != undefined) {
                    G_vmlCanvasManager.initElement(this.frontcanv);
                }
            }

            var frontcanv = this.frontcanv;
            frontcanv.width = $(this).width();
            frontcanv.height = $(this).height();
            frontcanv.style.zIndex = "1";
            frontcanv.style.position = 'absolute';

            // if our div was hidden, return it to its original state
            $(this).removeAttr('style');

            //
            // here we draw the background canvas
            //
            var ctx = backcanv.getContext('2d');
            var maxradius = ((backcanv.width > backcanv.height)
                            ? backcanv.height / 2 - 1
                            : backcanv.width / 2 - 1) * 0.75;

            // here is the backround white target
            var path = this.path = new Path2D();
            this.path.arc(backcanv.width / 2, backcanv.height / 2,
                  maxradius + 1, 0, Math.PI * 2, true);
            ctx.fillStyle = 'rgba(255, 255, 255, .8)';
            ctx.fill(path);

            // here are the concentric circles in the target
            // TODO: Add a setting for scale.
            frontcanv.px_per_unit = maxradius / 30;
            ctx.beginPath();

            for (var i = maxradius / 3; i <= maxradius; i += maxradius / 3) {
                ctx.moveTo(backcanv.width / 2 + i, backcanv.height / 2);
                ctx.arc(backcanv.width / 2, backcanv.height / 2,
                    i, 0, 2 * Math.PI);
            }
            ctx.closePath();
            ctx.stroke();

            // here are the direction indicator letters
            ctx.fillStyle = 'rgba(0, 0, 0, .8)';
            ctx.translate(backcanv.width / 2, backcanv.height / 2);
            var fontsize = backcanv.height / 20 + 1;
            var fontpad = backcanv.height / 50;

            if (window['G_vmlCanvasManager'] != undefined) {
                ctx.font= 'bold ' + fontsize + 'px Arial';
            } else {
                ctx.font= 'bold ' + fontsize + 'px Arial';
            }

            ctx.fillText('N', -5, -((backcanv.height / 2) - fontsize));
            ctx.fillText('S', -5, (backcanv.height / 2) - fontpad);
            ctx.fillText('W', -(backcanv.width / 2 - fontpad), 5);
            ctx.fillText('E', (backcanv.width / 2 - fontsize), 5);

            var numAngles = 8;
            for (var i = 0; i < numAngles; i++) {
                var angleSize = 360 / numAngles;
                var txt = (angleSize * i).toString();
                var txtWidth = ctx.measureText(txt).width;
                ctx.fillText(txt, -txtWidth / 2,
                         -(backcanv.height / 2 - (fontsize * 2) - fontpad + 1));
                ctx.rotate(angleSize * Math.PI / 180);
            }

            //
            // here we draw the front canvas
            // which we will be drawing on
            //
            ctx = frontcanv.getContext('2d');
            ctx.fillRect(20, 20, 150, 100);
            ctx.clearRect(20, 20, 150, 100);

            frontcanv.pressed = false;
            frontcanv.moved = false;

            $(frontcanv).mousedown(function (ev) {
                this.pressed = true;
                var coordinates = _this.getMousePosition(ev);
                var path = _this.path;
                var inPath = _this.checkPath(ctx, coordinates, path);
                
                if (inPath) {
                    _this.drawArrow(coordinates);
                    // pass our values to the configured move function
                    if (this.parentElement.settings &&
                        this.parentElement.settings['move'] !== null)
                    {
                        this.parentElement.settings['move'](this.pmag, this.pangle);
                    }
                }
            });

            $(frontcanv).mousemove(function (ev) {
                if (!this.pressed) {
                    return;
                }
                this.moved = true;
                var coordinates = _this.getMousePosition(ev);
                var path = _this.path;
                var inPath = _this.checkPath(ctx, coordinates, path);

                if (inPath) {
                    _this.drawArrow(coordinates);
                    // pass our values to the configured move function
                    if (this.parentElement.settings &&
                        this.parentElement.settings['move'] !== null)
                    {
                        this.parentElement.settings['move'](this.pmag, this.pangle);
                    }
                }
            });

            $(frontcanv).mouseup(function (ev) {
                if (this.pressed && this.moved) {

                    // pass our values to the configured change function
                    if (this.parentElement.settings &&
                        this.parentElement.settings['change'] !== null)
                    {
                        this.parentElement.settings['change'](this.pmag, this.pangle);
                    }
                }
                this.pressed = this.moved = false;
            });
        });
    };
})( jQuery );

