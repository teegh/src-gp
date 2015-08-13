//---------------------------
//プログレスバー用の進捗計算(0-100)
//---------------------------
var _Progressbar = (function() {

    var progressbar = {"progress":0 , "workerLength":0 , "currentWork":0};

    //プログレスバー　進捗の計算
    function instruProgressbar(){
        if(progressbar.workerLength != 0){
            progressbar.progress = Math.floor(progressbar.currentWork / progressbar.workerLength * 100);
        }else{
            progressbar.progress = 0;
        }
    }


    return {
        //全体の長さを設定
        setLength : function(inValue){
            progressbar.workerLength = inValue;
            progressbar.currentWork = 0;
            instruProgressbar();
        },
        //現在の値を設定
        setCurrent : function(invalue){
            progressbar.currentWork = inValue;
            instruProgressbar();
        },
        //現在の値をインクリメントする
        current_increment : function(){
            progressbar.currentWork++;
            instruProgressbar();
        },
        //進捗を100にする。
        progressComplete : function (){
            progressbar.progress = 100;
            progressbar.workerLength = 100;
            progressbar.currentWork = 100;
        },
        //進捗を得る
        getProgress : function (){
            instruProgressbar();
            return progressbar.progress;
        }
    };
})();