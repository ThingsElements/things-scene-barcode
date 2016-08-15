var { Component, Rect } = scene

const REDRAW_PROPS = ['symbol', 'text', 'scale_h', 'scale_w', 'rot', 'showText'];

// 참고 웹페이지.
// http://www.neodynamic.com/Products/Help/BarcodeWinControl2.5/working_barcode_symbologies.htm
const BARCODE_REGEXP = {
  'code11': /^[0-9\-]*$/,
  'codebar': /^[A-D][0-9\+$:\-/.]*[A-D]$/,
  'code39': {
    'normal': /^[0-9A-Z\-.$/\+%\*\s]*$/,
    'extended': /^[\000-\177]*$/
  },
  'code93': {
    'normal': /^[0-9A-Z\-.$/\+%\*\s]*$/,
    'extended': /^[\000-\177]*$/
  },
  'code128': {
    'auto': /^[\000-\177]*$/,
    'A': /^[\000-\137]*$/,
    'B': /^[\040-\177]*$/,
    'C': /^(([0-9]{2})+?)*$/
  },
  'datamatrix': /^[\x00-\xff]*$/, // 멀티바이트 캐릭터는 안됨 ?
  'ean8': /^\d{1,}$/,
  'ean13': /^\d{1,}$/,
  'industrial2of5': /^\d{1,}$/,
  'interleaved2of5': /^\d{1,}$/,
  'isbn': /^\d{9}[\d|X]$/,
  'msi': /^\d{1,}$/,
  'pdf417': {
    'text-compaction': /^[\011\012\015\040-\177]*$/,
    'binary-compaction': /^[\x00-\xff]*$/
  },
  'planet': /^\d{1,}$/,
  'postnet': /^\d{1,}$/,
  'ean128': /^[\000-\177\xC8\xCA-\xCD]*$/,
  'upca': /^\d{1,}$/,
  'upce': /^\d{1,}$/
};

const VALIDATORS = {
  '': (text) => {

  }, // function validator
  'code39': (text) => {
    return (text.match(/[^-0-9A-Z.$/+% ]/g) ||[]).reduce((sum, x) => {
      return sum.replace(x, ' ');
    }, text);
  }
};

export default class Barcode extends Rect {

  _draw(ctx) {
    var {
      symbol,
      showText,
      scale_h = 3,
      scale_w = 5,
      left = 0,
      top = 0,
      width = 0,
      height = 10,
      square = false,
      rotation,
      alpha = 1
    } = this.model

    var text = this.text;

    /* 바코드 텍스트가 변수에 의해서 변경될 수 있으므로 매번 이전 값고 비교한다. */
    if(this.lastText != text) {
      this.img = null;
      this.lastText = text
    }

    ctx.beginPath();
    ctx.globalAlpha = alpha;

    if(!this.img) {

      this.img = new Image();
      var image = this.img;
      var self = this;

      image.onload = function() {
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

        self.invalidate();
      };

      if (!this.img.src) {
        let regex = BARCODE_REGEXP[symbol];
        if(regex instanceof RegExp && !text.match(regex))
          console.error(`[${text}] is not valid for barcode '${symbol}' - \\${regex}\\.`)

        try {
          this.img.src = bwip.imageUrl({
            symbol,
            text,
            alttext : (showText == 'N') ? ' ' : '',
            scale_h,
            scale_w,
            rotation: 'N'
          })
        } catch(e) {
          console.log(e)
        }
      }
    }

    try {
      if(this.img)
        ctx.drawImage(this.img, left, top, width, height);

    } catch(e) {
      console.log(e)
    }

    ctx.stroke();
  }

  get text() {
    var type = this.get('type');
    var text = super.text;

    var validator = VALIDATORS[type];
    if(!validator)
      return text;

    return validator(text);
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
    var new_scale_w = Math.max(Math.floor(bounds.width / this.width_per_scale), 1);

    if(square) {
      // 폭과 높이가 같은 크기를 유지해야하는 square 타입의 경우에는,
      // 폭과 높이 방향 중 어느 방향으로 크게 움직였는지를 기준으로 scale 값을 결정한다.

      var old_scale_h = this.get('scale_h');
      var new_scale_h = Math.max(Math.floor(bounds.height / this.height_per_scale), 1);

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

        delete this.img;
      }

    } else {

      // left 바운드가 움직였다면, ..
      if(Math.abs(bounds.left - left) >= 10)
        left -= new_scale_w * this.width_per_scale - origin_bounds.width;

      width += new_scale_w * this.width_per_scale - origin_bounds.width;

      if(old_scale_w !== new_scale_w) {

        this.set('scale_w', new_scale_w);
        delete this.img;
      }
    }

    return {
      left,
      top,
      width,
      height
    }
  }

  onchange(props) {

    REDRAW_PROPS.every(prop => {
      if(props.hasOwnProperty(prop)) {
        delete this.img
        return false
      }
      return true
    })
  }

  drawText(context) {}

  get controls() {}
}

Component.register('barcode', Barcode);

/* Barcode를 scene을 통해서 export하기 위해서 .. */
scene.Barcode = Barcode;
