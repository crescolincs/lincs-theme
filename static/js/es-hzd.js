var HoriZontaDelic=function(){return{clicked:0,scrollbehaviour:"smooth",gap:0,clickuptarget:0,clickdowntarget:0,init:function(t){var i=this;this.addEvent("resize",window,function(t){i.setSizes()}),this.addEvent("keydown",window,function(t){i.setKeys(t)}),t&&t.id&&(this.hzdscroller=document.getElementById(t.id)),this.hzdscroller||(this.isIE||this.isFirefox?this.hzdscroller=document.documentElement:this.hzdscroller=document.body),t&&t.gap?this.gap=t.gap:this.gap=0,this.setSizes(),t&&t.prev&&(this.prev=document.getElementById(t.prev),this.addEvent("click",this.prev,function(t){i.clickDown(t)})),t&&t.next&&(this.next=document.getElementById(t.next),this.addEvent("click",this.next,function(t){i.clickUp(t)}))},addEvent:function(t,i,e){i.addEventListener?i.addEventListener(t,e,!1):i.attachEvent?i.attachEvent("on"+t,e):i[t]=e},setSizes:function(t){this.imagewidth=this.hzdscroller.children[0].clientWidth+this.gap,this.fullimagesinview=Math.trunc(this.hzdscroller.clientWidth/this.imagewidth),this.totalimages=this.hzdscroller.children.length,this.jumpsteps=Array(this.totalimages/this.fullimagesinview).fill(0).map((t,i)=>i*this.fullimagesinview+this.fullimagesinview)},setKeys:function(t){switch(t.key){case"ArrowRight":this.clickUp();break;case"ArrowDown":this.clicked=this.maxjumps,this.clickUp();break;case"ArrowLeft":this.clickDown();break;case"ArrowUp":this.clicked=-1*this.jumpsize,this.clickDown()}},cancelEvent:function(t){t||(t=window.event),t.target&&"IMG"===t.target.nodeName?t.preventDefault():t.srcElement&&"IMG"===t.srcElement.nodeName&&(t.returnValue=!1)},clickDown:function(t){this.clicked--,this.clickdowntarget=this.jumpsteps[this.clicked]-1,void 0===this.jumpsteps[this.clicked]?(this.hzdscroller.children[0].scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}),this.clicked=0):this.hzdscroller.children[this.jumpsteps[this.clicked]-1].scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})},clickUp:function(t){this.clicked++,this.clickuptarget=this.jumpsteps[this.clicked]-1,void 0===this.jumpsteps[this.clicked]?this.hzdscroller.children[this.hzdscroller.children.length-1].scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}):this.hzdscroller.children[this.jumpsteps[this.clicked]-1].scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})}}};