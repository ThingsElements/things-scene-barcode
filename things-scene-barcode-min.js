!function e(t,r,o){function n(a,u){if(!r[a]){if(!t[a]){var c="function"==typeof require&&require;if(!u&&c)return c(a,!0);if(i)return i(a,!0);var s=new Error("Cannot find module '"+a+"'");throw s.code="MODULE_NOT_FOUND",s}var l=r[a]={exports:{}};t[a][0].call(l.exports,function(e){var r=t[a][1][e];return n(r?r:e)},l,l.exports,e,t,r,o)}return r[a].exports}for(var i="function"==typeof require&&require,a=0;a<o.length;a++)n(o[a]);return n}({1:[function(e,t,r){"use strict";function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function i(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(r,"__esModule",{value:!0});var a=function(){function e(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,r,o){return r&&e(t.prototype,r),o&&e(t,o),t}}(),u=scene,c=u.Component,s=u.Rect,l=["symbol","text","alttext","scale_h","scale_w","rot","showText"],f=function(e){function t(){return o(this,t),n(this,Object.getPrototypeOf(t).apply(this,arguments))}return i(t,e),a(t,[{key:"_draw",value:function(e){var t=this.model,r=t.symbol,o=t.showText,n=t.scale_h,i=void 0===n?3:n,a=t.scale_w,u=void 0===a?5:a,c=t.left,s=void 0===c?0:c,l=t.top,f=void 0===l?0:l,h=t.width,d=void 0===h?0:h,p=t.height,v=void 0===p?200:p,y=t.rot,g=void 0===y?"N":y,b=(t.rotation,t.alpha),w=void 0===b?1:b,m=this.text;this.lastText!=m&&(this.img=null,this.lastText=m);var _="N"==o?" ":m;if(("R"!=g||"I"!=g||"B"!=g)&&(g="N"),e.beginPath(),e.globalAlpha=w,!this.img){this.img=new Image;var x=this.img,O=this;if(x.onload=function(){var e=x.height,t=x.width;O.set("width",t),"qrcode"===r?O.set("height",t):0>=v&&O.set("height",e),O.invalidate()},!this.img.src)try{this.img.src=bwip.imageUrl({symbol:r,text:m,alttext:_,scale_h:i,scale_w:u,rotation:g})}catch(j){console.log(j)}}try{e.drawImage(this.img,s,f,d,v)}catch(j){console.log(j)}e.stroke()}},{key:"adjustResize",value:function(e){var t=this.bounds;return{left:t.left,top:e.top,width:t.width,height:e.height}}},{key:"onchange",value:function(e){var t=this;l.every(function(r){return e.hasOwnProperty(r)?(delete t.img,!1):!0})}},{key:"drawText",value:function(){}},{key:"controls",get:function(){}}]),t}(s);r["default"]=f,c.register("barcode",f),scene.Barcode=f},{}],2:[function(e,t,r){"use strict";function o(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(r,"__esModule",{value:!0});var n=e("./barcode");Object.defineProperty(r,"Barcode",{enumerable:!0,get:function(){return o(n)["default"]}})},{"./barcode":1}]},{},[2]);