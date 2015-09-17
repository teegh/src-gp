//---------------------------
// 文字列置換 各種
//---------------------------

var _RepStrUtil = (function() {

    return {

        //エスケープ処理

        //htmlの属性に入れる文字に対するエスケープ
        Rep_htmlAttribute: function (inStr){
            return inStr.replace(/"/g,'&quot;');
        },
        //htmlのテキストに入れる文字に対するエスケープ
        Rep_htmlText: function (inStr){
            return inStr.replace(/</g,"&lt;").replace(/>/g,"&gt;");
        },
        //webSQL.jsにクエリを送る際のエスケープ
        Rep_webSQLjs: function (inStr){
            return inStr.replace(/'/g,"＜REP:’＞").replace(/%/g,"＜REP:％＞");
        },
        deRep_webSQLjs: function (inStr){
            return inStr.replace(/＜REP:’＞/g,"'").replace(/＜REP:％＞/g,"%");
        },
        //ファイルパスに関するエスケープ
        Rep_filePath: function (inStr){
            return inStr.replace(/\\/g,"\\");
        },
        //正規表現new RegExpを作る際のエスケープ
        Rep_newRegExp: function (inStr){
            return inStr.replace(/\\/g,"\\\\").replace(/\^/g,"\\^").replace(/\$/g,"\\$").replace(/\*/g,"\\*").replace(/\?/g,"\\?").replace(/\)/g,"\\)").replace(/\(/g,"\\(").replace(/\./g,"\\.").replace(/\(\?\:/g,"\\(\\?\\:").replace(/\(\?\=/g,"\\(\\?\\=").replace(/\(\?\!/g,"\\(\\?\\!").replace(/\|/g,"\\|").replace(/\{/g,"\\{").replace(/\}/g,"\\}").replace(/\[/g,"\\[").replace(/\]/g,"\\]");
        },

        //置換処理

        //値段をコンマ区切りで返す。
        Rep_AddPriceComma: function (inStr){
            return String(inStr).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' );

        },

        //(ゼロパディング)入力される数値を桁数に応じて、0を埋めた文字列として返す。
        Rep_numZeroPadding: function (inNum, inDigitsNum){
            var zeroString = "";
            for(var i=0; i<inDigitsNum; i++){
                zeroString += "0";
            }
            return (zeroString + String(inNum)).slice(-1*inDigitsNum);
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
        }


    };

    //---------------------------
    // エスケープしてデータベースに入力、検索
    //---------------------------
    // WebSQL.jsの半角文字との相性
    // としては、トランザクションINSERTでは半角記号すべてを入力できる。
    // (例)tr.executeSql("INSERT INTO fileList VALUES ( ?, ? )", [ "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~｡｢｣､･"　, fileInfo[1] ]
    // ただし、selectでは'が含まれるとエラーとなる。

})();