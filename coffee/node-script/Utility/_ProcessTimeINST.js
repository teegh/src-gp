//---------------------------
//実行時間の計測
//---------------------------
//
// (0) _ProcessTimeINST.startTimerINSTL();
// (1) console.log( "処理時間: " +_ProcessTimeINST.getTimerINSTL()[1] +" "); //0-1間の処理時間
// (2) console.log( "処理時間: " +_ProcessTimeINST.getTimerINSTL()[1] +" "); //1-2間の処理時間
var _ProcessTimeINST = (function(){//jquery closure

    var nowDate;
    var startTime;
    var saveStartTime;
    var currentTime;

    function computeDuration(inMs){
        var h = Math.floor(inMs / (60*60*1000) );
        var m = Math.floor((inMs - h * (60*60*1000)) / (60*1000));
        var s = Math.floor((inMs - h * (60*60*1000) - m * (60*1000))/1000);
        var ms = inMs - h * (60*60*1000) - m * (60*1000) - s*1000;
        return  h+'h '+m+'m '+s+'s '+ms+"ms (" + inMs+"ms)";
        // return h+'h '+ getStr_ZeroPadding(m,2)+'m '+getStr_ZeroPadding(s,2)+'s '+getStr_ZeroPadding(ms,3)+"ms";
    }

    function getStr_ZeroPadding(inNumber, inPaddingNum){
        return  String(inNumber + Math.pow(10,inPaddingNum) ).substring(1);
    }

    function set_saveStartTime(){
        saveStartTime = new Date();
        saveStartTime = nowDate.getTime();
    }

    function setStartTime(){
        nowDate     = new Date();
        startTime   = nowDate.getTime();
    }

    function setAfterTime(){
        nowDate     = new Date();
        currentTime = nowDate.getTime();
    }

    return {
        //計測開始
        startTimerINSTL: function(){
            setStartTime();
            set_saveStartTime();
        },
        //startTimerINSTLからの経過時間を取得
        getTotalTimerINSTL: function(){
            setAfterTime();
            var defTime     = currentTime - saveStartTime;
            return [ defTime, computeDuration(defTime) ];
        },
        //ラップタイム計測結果を取得 ( 返り値[mm秒,時分秒] )
        getTimerINSTL: function(){
            setAfterTime();
            var defTime     = currentTime - startTime;
            setStartTime();
            return [ defTime, computeDuration(defTime) ];
        }
    };
})();//jQuery Closure