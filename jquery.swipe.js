;window.Swipe = function(element, options) {
  if (!element) return null;

  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.speed = this.options.speed || 500;
  this.callback = this.options.callback || function() {};
  this.beforecall = this.options.beforecall || function() {};  

  this.container = element;
  this.isTouchWebkit="ontouchstart" in window && "WebKitCSSMatrix" in window;
  this.element = this.container.children[0]; 
  var _this=this,_el=$(_this.element);
  // static css
  this.container.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';
  this.element.style.margin = 0;

  this.setup();
  // add event listeners
   if(window.addEventListener){
	  this.element.addEventListener('touchstart', this, false);
	  this.element.addEventListener('touchmove', this, false);
	  this.element.addEventListener('touchend', this, false);
	  this.element.addEventListener('touchcancel', this, false);
	  this.element.addEventListener('webkitTransitionEnd', this, false);
	  window.addEventListener('resize', this, false);
   }
}
Swipe.prototype = {
  setLeft:(("ontouchstart" in window && "WebKitCSSMatrix" in window)?function(elem,px,duration){
		elem.css({
			webkitTransitionDuration: duration ? duration + "ms" : "0",
			webkitTransform:"translate3d(" + px+ "px,0,0)"});	
  }:function(elem,px){
		elem.css("left", px);
  }),
  setup: function() {	
	var _this=this,_container=$(_this.container),_el=$(_this.element);
    _this.slides = _this.element.children;
    _this.length = _this.slides.length;
    if (_this.length < 2) return null;
    _this.width = _container.width();
    if (!_this.width) return null;
    var origVisibility = _container.css("visibility");
    _container.css("visibility",'hidden');
    _el.css({"width":Math.ceil(_this.slides.length * _this.width) + 'px'});

    var index = _this.slides.length;
    while (index--) {
      var el = $(_this.slides[index]);
      el.css({"width":_this.width + 'px',"float":"left"});
    }
	if (_this.isTouchWebkit) {
			_el.css({
					webkitTransitionProperty: "-webkit-transform",
					webkitTransitionTimingFunction: "cubic-bezier(0,0,0.25,1)"
			});
	}
    this.slide(this.index, 0); 
   _container.css("visibility",origVisibility);
	
  },
  slide: function(index, duration) {
	var _this = this,_el=_this.element;
    if (duration == undefined) {
        duration = this.speed;
    }
	_this.beforecall(_this.index);
	if(_this.isTouchWebkit&&!isComputer){
		_this.setLeft($(_el),-(index * _this.width),500);
	}else{
		$(_el).stop(true,false).animate({"left":-(index * _this.width)+"px"},{
		duration: duration,
		complete: function(e){
			_this.callback(e, _this.index, _this);}
		});
	}

    _this.index = index;
  },
  getPos: function() {
    return this.index;
  },

  prev: function(delay) {
    if (this.index) this.slide(this.index-1, this.speed); 
    else this.slide(this.length - 1, this.speed);
  },
  next: function(delay) {
    
    this.delay = delay || 0;
    if (this.index < this.length - 1) this.slide(this.index+1, this.speed);
    else this.slide(0, this.speed); 
  },
  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchcancel' :
      case 'touchend': this.onTouchEnd(e); break;
	  case 'webkitTransitionEnd': this.transitionEnd(e); break;
      case 'resize':this.setup(); break;
    }
  },
  transitionEnd: function(e) {
    this.callback(e, this.index, this.slides[this.index]);
  },
  onTouchStart: function(e) {    
    this.start = {
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,
      time: Number( new Date() )
    };
    this.isScrolling = undefined;    
    this.deltaX = 0;
    e.stopPropagation();
  },

  onTouchMove: function(e) {
	var _this=this,_el=$(_this.element);

    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

    this.deltaX = e.touches[0].pageX - _this.start.pageX;

    if ( typeof _this.isScrolling === 'undefined') {
      _this.isScrolling = !!( _this.isScrolling || Math.abs(_this.deltaX) < Math.abs(e.touches[0].pageY - _this.start.pageY) );
    }

    if (!_this.isScrolling) {

      e.preventDefault();

      _this.deltaX = 
        _this.deltaX / 
		( (!_this.index && _this.deltaX > 0            
            || _this.index == _this.length - 1              
            && _this.deltaX < 0                           
          ) ?                      
          ( Math.abs(_this.deltaX) / this.width + 1 )    
          :1 );                                        

	  _this.setLeft(_el,_this.deltaX - _this.index * _this.width);
	  // _this.start.pageX=e.touches[0].pageX;
      e.stopPropagation();
    }

  },

  onTouchEnd: function(e) {	
    var isValidSlide =Number(new Date()) - this.start.time < 250 && Math.abs(this.deltaX) > 20|| Math.abs(this.deltaX) > this.width/40,
    isPastBounds = 
          !this.index && this.deltaX > 0                         
          || this.index == this.length - 1 && this.deltaX < 0;  

 
    if (!this.isScrolling) {
     
      this.slide( this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ), this.speed );
    }
    e.stopPropagation();
  }

  
}

