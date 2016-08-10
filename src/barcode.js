var { Component, Rect } = scene

const REDRAW_PROPS = ['symbol', 'text', 'alttext', 'scale_h', 'scale_w', 'rot', 'showText']

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
      height = 200,
      rot = 'N',
      rotation,
      alpha = 1
    } = this.model

    var text = this.text;

    /* 바코드 텍스트가 변수에 의해서 변경될 수 있으므로 매번 이전 값고 비교한다. */
    if(this.lastText != text) {
      this.img = null;
      this.lastText = text
    }

    var alttext = showText == 'N' ? ' ' : text; // alttext값은 bwip에 던져주는 텍스트

    if(rot != 'R' || rot !='I' || rot !='B')    // rot이 R, I, B 3개 값이 아니면 Defualt값 N
      rot = 'N';

    ctx.beginPath();
    ctx.globalAlpha = alpha;

    if(!this.img) {
      this.img = new Image();
      var image = this.img;
      var self = this;

      image.onload = function() {

        self.invalidate();
      };

      if (!this.img.src) {
        try {
          this.img.src = bwip.imageUrl({
            symbol,
            text,
            alttext,
            scale_h,
            scale_w,
            rotation: rot, // rotation 속성 이름 충돌되므로 rot로 변경함.
          })
        } catch(e) {
          console.log(e)
        }
      }
    }

    try {
      ctx.drawImage(this.img, left, top, width, height);
    } catch(e) {
      console.log(e)
    }
    ctx.stroke();
  }

  adjustResize(bounds, diagonal) {
    /* Barcode의 경우는 외부로부터의 width의 변경을 지원하지 않는다. */
    var old = this.bounds;

    return {
      left: old.left,
      top: bounds.top,
      width: old.width,
      height: bounds.height
    };
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
