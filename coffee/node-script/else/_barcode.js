var _Barcode = (function(){

  var Barcode = require('tualo-barcode').Barcode;
  // var BarcodeWidth = '250'; //159   //生成されるコードの幅 code_39_svgの幅を見ながら随時調整が必要。

  function getCode39svg_call(inStr, inBarcodeWidth){
    var code_39_svg = (new Barcode({
        type: 'Code39',
        width: String(inBarcodeWidth)
            })).getSVG(inStr,true);

    code_39_svg = code_39_svg.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>',"");
    code_39_svg = code_39_svg.replace('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',"");
    code_39_svg = code_39_svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 '+inBarcodeWidth+' 36" preserveAspectRatio="xMidYMid meet" ');


    code_39_svg = code_39_svg.replace(/mm"/g,'"');

    return code_39_svg;
  }



  return {
    getCode39svg : function(inStr, inBarcodeWidth) {
      return getCode39svg_call(inStr, inBarcodeWidth);
    }
  };

  //レスポンシブsvg
  //[slim]
  //
  //.mod-inline-svg
  //  svg
  //
  //[scss]
  // .mod-inline-svg {
  //   position: relative;
  //   height:0;
  //   padding-top:20%;  //アスペクト比。サンプルでは360/790なので大体で45%にしています。
  //   svg {
  //     display:block;
  //     position: absolute;
  //     top:0;
  //     left:0;
  //     height: 100%;
  //     width: 100%;
  //     background-color: #b8b;
  //   }
  // }

})();





//node-webkitで標準出力のエラーを吸収してくれる
var Readable = require("stream").Readable;
var util = require("util");
util.inherits(MyStream, Readable);
function MyStream(opt) {
  Readable.call(this, opt);
}
MyStream.prototype._read = function() {};
// hook in our stream
process.__defineGetter__("stdin", function() {
  if (process.__stdin) return process.__stdin;
  process.__stdin = new MyStream();
  return process.__stdin;
});
