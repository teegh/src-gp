//---------------------------
// 文字列に関する処理 各種
//---------------------------

var _RepStrUtil = (function(){//jquery closure


    //文字数を取得 (半角1, 全角2としてカウント)
    function getCharCount(str){
      if(!str)return 0;
      len = 0;
      str = escape(str);
      for (i=0;i<str.length;i++,len++) {
        if (str.charAt(i) == "%") {
          if (str.charAt(++i) == "u") {
            i += 3;
            len++;
          }
          i++;
        }
      }
      return len;
    }

    return {

        //----------------------
        //エスケープ処理
        //----------------------

        //htmlの属性に入れる文字に対するエスケープ
        Rep_htmlAttribute: function (inStr){
            if(!inStr)return "";
            return inStr.replace(/"/g,'&quot;');
        },
        //htmlのテキストに入れる文字に対するエスケープ
        Rep_htmlText: function (inStr){
            if(!inStr)return "";
            return inStr.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        },
        //webSQL.jsにクエリを送る際のエスケープ
        Rep_webSQLjs: function (inStr){
            if(!inStr)return "";
            return inStr.replace(/'/g,"＜REP:’＞").replace(/%/g,"＜REP:％＞");
        },
        deRep_webSQLjs: function (inStr){
            if(!inStr)return "";
            return inStr.replace(/＜REP:’＞/g,"'").replace(/＜REP:％＞/g,"%");
        },
        //ファイルパスに関するエスケープ
        Rep_filePath: function (inStr){
            if(!inStr)return "";
            return inStr.replace(/\\/g,"\\");
        },
        //正規表現new RegExpを作る際のエスケープ
        Rep_newRegExp: function (inStr){
            if(!inStr)return "";
            return inStr.replace(/\\/g,"\\\\").replace(/\^/g,"\\^").replace(/\$/g,"\\$").replace(/\*/g,"\\*").replace(/\?/g,"\\?").replace(/\)/g,"\\)").replace(/\(/g,"\\(").replace(/\./g,"\\.").replace(/\(\?\:/g,"\\(\\?\\:").replace(/\(\?\=/g,"\\(\\?\\=").replace(/\(\?\!/g,"\\(\\?\\!").replace(/\|/g,"\\|").replace(/\{/g,"\\{").replace(/\}/g,"\\}").replace(/\[/g,"\\[").replace(/\]/g,"\\]");
        },

        //------------------------
        //置換処理
        //------------------------

        //値段をコンマ区切りで返す。
        Rep_AddPriceComma: function (inStr){
            if(!inStr)return "";
            return String(inStr).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' );

        },

        //(ゼロパディング)入力される数値を桁数に応じて、0を埋めた文字列として返す。
        Rep_numZeroPadding: function (inNum, inDigitsNum){
            var num = inNum;
            if(!num)num=0;
            var zeroString = "";
            for(var i=0; i<inDigitsNum; i++){
                zeroString += "0";
            }
            return (zeroString + String(num)).slice(-1*inDigitsNum);
        },
        
        //指定された半角文字数の半角空白で、文字の後半を埋めた文字列を返す
        Rep_SpacePaddingString : function(inStr, inPaddingLength){
          var str = inStr;
          if(!str)str = "";
          str = String(str);
          var strL = getCharCount(str);
          var paddSpace = "";
          
          var addN = inPaddingLength - strL;
          if(addN < 0)addN = 0;
          
          for(var i=0; i<addN; i++){
            paddSpace+= " ";
          }
          
          return str + paddSpace;
          
        },

        //16進数のカラーコード(#000000)をrgb(##, ##, ##)の形式に変換する。
        //http://php.o0o0.jp/article/jquery-rgb_color
        Rep_HEXColorToRGBColor : function (inStr){

            if(inStr && inStr != ""){

                if (inStr.length == 3+1) {
                  // #abcをa,b,cに分割
                  var hex_3digit = inStr.match(/^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})/);
                  // aa
                  var hex_r = hex_3digit[1] + hex_3digit[1];
                  // bb
                  var hex_g = hex_3digit[2] + hex_3digit[2];
                  // cc
                  var hex_b = hex_3digit[3] + hex_3digit[3];
                } else if(inStr.length == 6+1){
                  // #abcdefをab,cd,efに分割
                  var hex_6digit = inStr.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
                  // console.log( inStr+"->" + hex_6digit);
                  // ab
                  var hex_r = hex_6digit[1];
                  // cd
                  var hex_g = hex_6digit[2];
                  // ef
                  var hex_b = hex_6digit[3];
                }else{
                    return null;
                }

                // 16進数から10進数へ
                var rgb_r = parseInt(hex_r, 16);
                var rgb_g = parseInt(hex_g, 16);
                var rgb_b = parseInt(hex_b, 16);

                return "rgb("+ rgb_r+", "+rgb_g +", "+ rgb_b +")";
            }else{
                return null;
            }
        },
        
        
        
        //------------------------
        //文字の情報を取得
        //------------------------
        
        getCharCount : function (inStr){
          if(!inStr)return 0;
          return getCharCount(inStr);
        }
        
  


    };
    

    //---------------------------
    // エスケープしてデータベースに入力、検索
    //---------------------------
    // WebSQL.jsの半角文字との相性
    // としては、トランザクションINSERTでは半角記号すべてを入力できる。
    // (例)tr.executeSql("INSERT INTO fileList VALUES ( ?, ? )", [ "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~｡｢｣､･"　, fileInfo[1] ]
    // ただし、selectでは'が含まれるとエラーとなる。

})();//jQuery Closure