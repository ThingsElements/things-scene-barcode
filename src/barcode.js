/*
 * Copyright © HatioLab Inc. All rights reserved.
 */
var { Component, RectPath } = scene
import Bitmap from './bitmap'

const REDRAW_PROPS = ['symbol', 'text', 'scale_h', 'scale_w', 'rot', 'showText', 'height'];

/*  opts 예제 - https://github.com/bwipp/postscriptbarcode/wiki/Options-Reference
 *  includecheck, includecheckintext, includetext, textfont, textsize, textgaps, textxalign, textyalign, textxoffset, textyoffset
 *  showborder, borderwidth, borderleft, borderright, bordertop, borderbottom, barcolor, backgroundcolor, bordercolor, textcolor
 *  parse, parsefnc, height, width, inkspread, inkspreadh, inkspreadv,
 *  addontextxoffset, addontextyoffset, addontextfont, addontextsize
 *  guardwhitespace, guardwidth, guardheight, guardleftpos, guardrightpos, guardleftypos, guardrightypos
 */

symdesc['code39'].opts = "includetext textxalign=center textgaps=2"
symdesc['interleaved2of5'].opts = "includetext textxalign=center textgaps=1.5"
symdesc['code93'].opts = "includetext textxalign=center textgaps=2"
symdesc["ean13"].opts = "includetext"
symdesc["ean8"].opts = "includetext"

function adjustScale(symbol, text){
  switch(symbol) {
  case 'code128': // 문자가 섞이면 bwip에서 크기는 너무 크게그려서 문자가 들어갈 시 1.5배로 더 작게 그리게 함
  if(Number(text))
    return 2;
  else
    return 1.5;
  case 'ean13':
    return 1.35;
  case 'interleaved2of5': // 작아져야 하는데 1 이하론 안작아짐..?
    return 1;
  case 'code93':
    return 1.5;
  case 'upce':
    return 1.3;
  case 'msi':
    return 1.3;
  case 'plessey': // 작아져야 하는데 1 이하론 안작아짐..?
    return 1;
  case 'ean8':
    return 1.3;
  case 'ean13':
    return 1;
  default:
    return 1;
  }
}
// 참고 웹페이지.
// http://www.neodynamic.com/Products/Help/BarcodeWinControl2.5/working_barcode_symbologies.htm
// const BARCODE_REGEXP = {
//   'code11': /^[0-9\-]*$/,
//   'codebar': /^[A-D][0-9\+$:\-/.]*[A-D]$/,
//   'code39': {
//     'normal': /^[0-9A-Z\-.$/\+%\*\s]*$/,
//     'extended': /^[\000-\177]*$/
//   },
//   'code93': {
//     'normal': /^[0-9A-Z\-.$/\+%\*\s]*$/,
//     'extended': /^[\000-\177]*$/
//   },
//   'code128': {
//     'auto': /^[\000-\177]*$/,
//     'A': /^[\000-\137]*$/,
//     'B': /^[\040-\177]*$/,
//     'C': /^(([0-9]{2})+?)*$/
//   },
//   'datamatrix': /^[\x00-\xff]*$/, // 멀티바이트 캐릭터는 안됨 ?
//   'ean8': /^\d{1,}$/,
//   'ean13': /^\d{1,}$/,
//   'industrial2of5': /^\d{1,}$/,
//   'interleaved2of5': /^\d{1,}$/,
//   'isbn': /((978[\--– ])?[0-9][0-9\--– ]{10}[\--– ][0-9xX])|((978)?[0-9]{9}[0-9Xx])/,
//   'msi': /^\d{1,}$/,
//   'pdf417': {
//     'text-compaction': /^[\011\012\015\040-\177]*$/,
//     'binary-compaction': /^[\x00-\xff]*$/
//   },
//   'planet': /^\d{1,}$/,
//   'postnet': /^\d{1,}$/,
//   'ean128': /^[\000-\177\xC8\xCA-\xCD]*$/,
//   'upca': /^\d{1,}$/,
//   'upce': /^\d{1,}$/
// };

export default class Barcode extends RectPath(Component) {

  _draw(ctx) {
    var {
      left = 0,
      top = 0,
      width = 0,
      height = 10,
      alpha = 1
    } = this.model

    var text = this.text || '';

    /* 바코드 텍스트가 변수에 의해서 변경될 수 있으므로 매번 이전 값과 비교한다. */
    this.prepareIf(!this.image || this.lastText != text);

    this.lastText = text;

    ctx.beginPath();
    ctx.globalAlpha = alpha;

    try {
      if(this.image)
        ctx.drawImage(this.image, left, top, width, height);

    } catch(e) {
      console.log(e)
    }
  }

  prepare(resolve, reject) {
    // var text = this.text || '';

    // 1. 먼저 만족하지 않는 조건인 경우에, 바로 리턴한다.
    // if(!text) {
    //   resolve(this);
    //   return;
    // }

    // 2. 재진입되지 않는 조건을 먼저 설정한다. (주로 핵심적인 멤버변수를 생성한다.)
    //    prepareIf(cond) 의 조건으로 핵심 멤버변수가 설정되지 않은 경우로 로직을 만들 수 있도록 한다.
    this.image = new Image();

    // 3. 비동기 콜백에 대한 핸들링
    var self = this;
    var image = this.image;
    var {
      showText = true,
      scale_h = 3,
      scale_w = 5,
      square = false,
      symbol
    } = this.model;

    this.image.onload = function() {
      self.width_per_scale = image.width / scale_w;

      if(square) {
        self.height_per_scale = image.height / scale_h;
        self.set({
          width: image.width,
          height: image.height
        });
      } else {
        self.set('width', image.width);
      }

      resolve(this);
    }

    this.image.onerror = function(error) {
      reject(error);
    }

    // 4. 비동기 상황을 트리거링
    // let regex = BARCODE_REGEXP[symbol];
    // if(regex instanceof RegExp && !text.match(regex))
    //   console.error(`[${text}] is not valid for barcode '${symbol}' - \\${regex}\\.`)

    try {
      this.image.src = this.imageUrl()
    } catch(e) {
      console.log(e)
    }
  }

  onchange(props) {

    REDRAW_PROPS.every(prop => {
      if(props.hasOwnProperty(prop)) {
        delete this.image;
        return false;
      }
      return true;
    })
  }

  adjustResize(bounds, origin_bounds, diagonal) {
    /* 바코드는 diagonal 옵션을 무시한다. */
    if(!this.width_per_scale)
      return origin_bounds;

    var square = !!this.get('square');

    var left = origin_bounds.left;
    var width = origin_bounds.width;
    var top = square ? origin_bounds.top : bounds.top;
    var height = square ? origin_bounds.height : bounds.height;

    var old_scale_w = this.get('scale_w');
    var new_scale_w = Math.max(Math.round(bounds.width / this.width_per_scale), 1);

    if(this._last_width && (this._last_width >= bounds.width && old_scale_w < new_scale_w)
    || (this._last_width <= bounds.width && old_scale_w > new_scale_w))
      new_scale_w = old_scale_w

    this._last_width = bounds.width;

    if(square) {
      // 폭과 높이가 같은 크기를 유지해야하는 square 타입의 경우에는,
      // 폭과 높이 방향 중 어느 방향으로 크게 움직였는지를 기준으로 scale 값을 결정한다.

      var old_scale_h = this.get('scale_h');
      var new_scale_h = Math.max(Math.round(bounds.height / this.height_per_scale), 1);

      var scale = Math.abs(origin_bounds.width - bounds.width) > Math.abs(origin_bounds.height - bounds.height) ?
        new_scale_w : new_scale_h;

      // top 바운드가 움직였다면, ..
      if(Math.abs(bounds.top - top) >= 10)
        top -= scale * this.height_per_scale - origin_bounds.height;

      // left 바운드가 움직였다면, ..
      if(Math.abs(bounds.left - left) >= 10)
        left -= scale * this.width_per_scale - origin_bounds.width;

      width += scale * this.width_per_scale - origin_bounds.width;
      height += scale * this.height_per_scale - origin_bounds.height;

      if(old_scale_w !== scale || old_scale_h !== scale) {

        this.set({
          scale_w: scale,
          scale_h: scale
        });

        delete this.image;
      }

    } else {

      // left 바운드가 움직였다면, ..
      if(Math.abs(bounds.left - left) >= 10)
        left -= new_scale_w * this.width_per_scale - origin_bounds.width;

      width += new_scale_w * this.width_per_scale - origin_bounds.width;

      if(old_scale_w !== new_scale_w) {
        this.set('scale_w', new_scale_w);
        delete this.image;
      }
    }

    return {
      left,
      top,
      width,
      height
    }
  }

  drawText(context) {}

  get controls() {}

  imageUrl() {

    var {
      symbol,
      showText,
      scale_w
    } = this.model

    var text = this.text || '';
    var alttext = showText ? '' : ' ';
    var scale_h = 0.5;

    var optstr = symdesc[symbol].opts;

  	// Convert the options to a dictionary object, so we can pass alttext with
  	// spaces.
  	var tmp = optstr.split(' ');
  	var opts = {};
  	for (var i = 0; i < tmp.length; i++) {
  		if (!tmp[i]) {
  			continue;
  		}
  		var eq = tmp[i].indexOf('=');
  		if (eq == -1) {
  			opts[tmp[i]] = true;
  		} else {
  			opts[tmp[i].substr(0, eq)] = tmp[i].substr(eq+1);
  		}
  	}

  	// Add the alternate text
  	if (alttext) {
  		opts.alttext = alttext;
  		opts.includetext = true;
    }

    opts.textsize = 6 + scale_w / 2;

    // 스퀘어는 높이와 넓이를 자동 조정 하므로 height를 바꿔주면 넓이도 바뀌게 됨(높이와 넓이가 서로 바뀌는 현상이 무한루프됨)
    if(!this.model.square)
      opts.height = Math.round((this.model.height - 8 * scale_w) / 254 * 10) / 10;

    // var bw = new BWIPJS(Module, 1); // for monochrome
    var bw = new BWIPJS(Module, 0); // for Anti-aliased

  	// BWIPP does not extend the background color into the
  	// human readable text.  Fix that in the bitmap interface.
  	if (opts.backgroundcolor) {
  		bw.bitmap(new Bitmap(opts.backgroundcolor));
  		delete opts.backgroundcolor;
  	} else {
  		bw.bitmap(new Bitmap);
  	}

    // Set the scaling factors
    var adjustedScale = adjustScale(symbol, text)
	  bw.scale(scale_w * adjustedScale, scale_w * adjustedScale);

  	// Add optional padding to the image
  	bw.bitmap().pad(+opts.paddingwidth*scale_w || 0,
  					+opts.paddingheight*scale_h || 0);

    if(!Barcode.canvas) {
      Barcode.canvas = document.createElement('canvas');
      Barcode.canvas.style.display = 'none';
      Barcode.canvas.height = 1;
    	Barcode.canvas.width  = 1;
      document.body.appendChild(Barcode.canvas);
    }

    try {
      BWIPP()(bw, symbol, text, opts);
    } catch(e) {
      // TODO 오류처리.
      console.error(e);

      var bm = bw.bitmap();
      return bm.error(Barcode.canvas, 'N');
    }

    return bw.bitmap().show(Barcode.canvas, 'N');
  }
}

Component.register('barcode', Barcode);

/* Barcode를 scene을 통해서 export하기 위해서 .. */
scene.Barcode = Barcode;
