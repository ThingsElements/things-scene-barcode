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
      height = 200,
      rot = 'N',
      rotation,
      alpha = 1
    } = this.model

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
        var h = image.height;
        var w = image.width;
        self.model.orginWidth = w; // nerrow bar가 1이고 ratio가 3일때 넓이를 가지고 있는다.

        if (zpl && zpl.config && zpl.config.dpi > 0) {
          // 1. 프린트에서 몇 인치로 찍힐지를 구한다.
          // var zplWidth = w/zpl.config.dpi
          // 2. 스크린에 몇 픽셀로 그릴지를 계산한다.
          // w = zplWidth * 25.4 * self.app.PPM
          
          w /= 2
        }

        let unit = self.root.model_layer.model ? self.root.model_layer.model.unit : 1;
        if (unit === 'mm' || unit === 'cm') {
          w /= (self.app.PPM/10 || 1)
          h /= (self.app.PPM/10 || 1)
        }

        self.set('width', w);

        if (symbol === 'qrcode') {
          self.set('height', w);
        } else if(height <= 0) {
          self.set('height', h/2);
        }

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

Component.register('barcode', Barcode)
