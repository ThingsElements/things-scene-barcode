var { Component, Rect } = scene

const REDRAW_PROPS = ['symbol', 'text', 'alttext', 'scale_h', 'scale_w', 'rot', 'showText']

export default class Barcode extends Rect {

  _draw(ctx) {
    var {
      symbol,
      text,
      showText,
      scale_h = 3,
      scale_w = 5,
      left = 0,
      top = 0,
      width = 0,
      height = 270,
      rot = 'N',
      rotation,
      alpha = 1,
      hidden = false
    } = this.model

    var alttext = showText == 'N' ? ' ' : text; // alttext값은 bwip에 던져주는 텍스트

    if(rot != 'R' || rot !='I' || rot !='B')    // rot이 R, I, B 3개 값이 아니면 Defualt값 N
      rot = 'N';

    ctx.beginPath();
    ctx.globalAlpha = alpha;

    if(!this.__valid__) {
      this.img = new Image();

      var self = this;
      this.img.onload = function() {
        if (!width || width <= 0) {
          var h = self.img.height;
          var w = self.img.width;

          var realWidth = w / h * height;
          self.set('width', realWidth);
        }

        self.invalidate();
        self.__valid__ = true
      };

      if (!this.img.src) {
        this.img.src = bwip.imageUrl({
          symbol,
          text,
          alttext,
          scale_h,
          scale_w,
          rotation: rot, // rotation 속성 이름 충돌되므로 rot로 변경함.
        })
      }
    }

    if(!hidden){
      ctx.drawImage(this.img, left, top, width, height);
      ctx.stroke();
    }
  }

  onchange(props) {

    REDRAW_PROPS.every(prop => {
      if(props.hasOwnProperty(prop)) {
        this.__valid__ = false
        return false
      }
      return true
    })
  }

  drawText(context) {}

  get controls() {}
}

Component.register('barcode', Barcode)
