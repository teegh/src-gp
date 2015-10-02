//---------------------------
// 文字コードの置換
//---------------------------

var _RepCharCode = (function(){//jquery closure

    var jschardet    = require('jschardet');   //npm
    var Iconv        = require('iconv-lite');
    var charEncoding = "";
    var buff;

    return {

        //対象の文字列のエンコードを取得する。
        getEncode: function (inStr){
            return getEncode_call( inStr );
        }
        // ,
        
        // //対象の文字列をutf-8に変換する。
        // decodeUTF8 : function (inStr){
        //   buff = null;
          
        //   //ファイル自体が文字化けか？
          
        //   charEncoding = getEncode_call( inStr );
        //   if(charEncoding == "ascii" || charEncoding == "SHIFT_JIS"){
        //     buff = Iconv.encode(inStr, "Shift_JIS");
            
        //   }else if(charEncoding.indexOf("windows-") != -1){
        //     buff = Iconv.encode(inStr, charEncoding);
        //   }
          
        //   if(buff != null){
        //     return buff.toString('utf8', 0, buff.length);
        //   }else{
        //     return inStr;
        //   }
        // }
    };
    
    function getEncode_call(inStr){
      return jschardet.detect( inStr ).encoding;
    }


})();//jQuery Closure