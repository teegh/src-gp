//---------------------------
//実行時間の計測
//---------------------------
var _ProcessTimeINST = (function() {

    var startTime;

    function computeDuration(ms){
        var h = String(Math.floor(ms / 3600000) + 100).substring(1);
        var m = String(Math.floor((ms - h * 3600000)/60000)+ 100).substring(1);
        var s = String(Math.round((ms - h * 3600000 - m * 60000)/1000)+ 100).substring(1);
        return h+'時間'+m+'分'+s+'秒';
    }

    return {
        //計測開始
        startTimerINSTL: function(){
            startTime = null;
            startTime = new Date();
        },
        //計測結果を取得 (返り値[mm秒,時分秒])
        getTimerINSTL: function(){
            var currentTime = new Date();
            var defTime = (currentTime - startTime);
            return [defTime,computeDuration(defTime)];
        }
    };
})();