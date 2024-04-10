/*
 * horizontadelic - using dom overflow:scroll
 * by dindinet
 */
var HoriZontaDelic = function () {
    'use strict';
    
    var module = {
        //axis: 'x',
        clicked: 0,
        scrollbehaviour: 'smooth',
        gap: 0,
        clickuptarget: 0,
        clickdowntarget: 0,
        /**
         * @method init
         */
        init: function (options) {
          //console.log(options);
            var me = this;
            this.addEvent('resize',window,function(e){me.setSizes()})//reset the size of the scroll jump when browser changes size
            if (options && options.arrowkeys) {
            this.addEvent('keydown',window,function(e){me.setKeys(e)})
            }
            //this.options = options;
            
            // find target element scroller or fall back to body
            if (options && options.id) {
                this.hzdscroller = document.getElementById(options.id);
            }
            if (!this.hzdscroller) {
                if (this.isIE || this.isFirefox) {
                    this.hzdscroller = document.documentElement;
                } else {
                    this.hzdscroller = document.body;
                }
            }
            if (options && options.gap){this.gap = options.gap}else{this.gap = 0}
            
            this.setSizes()
            
            // if scroll options exist add events
            if (options && options.prev) {
                this.prev = document.getElementById(options.prev);
                this.addEvent('click', this.prev, function (e) {
                    me.clickDown(e);
                });
            }
            if (options && options.next) {
                this.next = document.getElementById(options.next);
                this.addEvent('click', this.next, function (e) {
                    me.clickUp(e);
                });
  
            }
  
        },
        /**
         * @method addEvent
         */
        addEvent: function (name, el, func) {
            if (el.addEventListener) {
                el.addEventListener(name, func, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + name, func);
            } else {
                el[name] = func;
            }
        },
              /**
        * @method getjumpsteps
        */
        getjumpsteps: function (totimgs,imagesinview) {
             var inttotsteps = Math.trunc(totimgs/imagesinview);
             var inttotstepsimagesinview = inttotsteps*imagesinview;
             var jumpsteps = Array(inttotstepsimagesinview/imagesinview).fill(0).map((e,i)=>(i*imagesinview)+imagesinview)
             if(inttotstepsimagesinview < totimgs){jumpsteps.push(totimgs)}
             return jumpsteps
             },
        /**
        * @method setSizes
        */
        setSizes: function (e) {
          this.imagewidth = this.hzdscroller.children[0].clientWidth + this.gap;
          this.fullimagesinview = Math.trunc(this.hzdscroller.clientWidth/this.imagewidth)
          this.totalimages = this.hzdscroller.children.length
          this.jumpsteps = this.getjumpsteps(this.totalimages,this.fullimagesinview)
       },
        /**
        * @method setKeys
        */
        setKeys: function (e) {
          //console.log('setting Keys')
          switch (e.key) {
            case "ArrowRight":
               this.clickUp();
            break;
            case "ArrowDown":
              this.clicked = this.maxjumps;
              this.clickUp();
            break;
            case "ArrowLeft":
              this.clickDown();
            break;
            case "ArrowUp":
              this.clicked = this.jumpsize*-1;
              this.clickDown();
            break;
         }
       },
        /**
         * @method cancelEvent
         */
        cancelEvent: function (e) {
            if (!e) { e = window.event; }
            if (e.target && e.target.nodeName === 'IMG') {
                e.preventDefault();
            } else if (e.srcElement && e.srcElement.nodeName === 'IMG') {
                e.returnValue = false;
            }
        },
        /**
         * @method clickDown
         */
        clickDown: function (e) {
            this.clicked--
            this.clickdowntarget = this.jumpsteps[this.clicked]-1
            if(this.jumpsteps[this.clicked] === undefined ){
              //console.log('clickDown 👎')
              this.hzdscroller.children[0].scrollIntoView({ behavior: "smooth"})
              this.clicked = 0
            }else{
              //console.log('clickDown 👍')
              this.hzdscroller.children[this.jumpsteps[this.clicked]-1].scrollIntoView({ behavior: "smooth"})
            }
        },
        /**
         * @method clickUp
         */
        clickUp: function (e) {
          this.clicked++
          this.clickuptarget = this.jumpsteps[this.clicked]-1
          if(this.jumpsteps[this.clicked] === undefined ){  
            //console.log('clickUp 👎')
            this.hzdscroller.children[this.hzdscroller.children.length-1].scrollIntoView({ behavior: "smooth"})
          }else{
            //console.log('clickUp 👍')
            this.hzdscroller.children[this.jumpsteps[this.clicked]-1].scrollIntoView({ behavior: "smooth"})
          }
  
        }, 
    };
    return module;
  };