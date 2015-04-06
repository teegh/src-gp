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