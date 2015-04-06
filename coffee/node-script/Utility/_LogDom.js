//---------------------------
// ログとして、DOMに出力
//---------------------------
var _LogDom = (function() {


    var readStatusClearTimer;
    var selectFileStatusClearTimer;


    function clearTimer_readStatus(){
      clearTimeout(readStatusClearTimer);
      readStatusClearTimer = null;
    }
    function clearReadStatus(){
      clearTimer_readStatus();
      $(".readDisp").addClass("hidden");
      _LogDom.fileloadStatus("");
    }

    function clearTimer_selectFileStatus(){
      clearTimeout(selectFileStatusClearTimer);
      selectFileStatusClearTimer = null;
    }
    function clearSelectFileStatus(){
      clearTimer_selectFileStatus();

      $(".selectFileStatus").addClass("hidden");
      _LogDom.selectFileStatus("");
    }

    return{
        debugMes: function(inStr){
          $(".debugTemp").append("<p>"+inStr+"</p>");
        },
        //読み込み
        fileloadStatus: function(inStr){
            if(inStr != ""){
              $(".readFileStatus").html('<p class="readStatusMes"><i class="fa fa-fw fa-refresh"></i>&nbsp;'+inStr+"</p>");
            }else{
              $(".readFileStatus").html('');
            }
        },
        removeFileloadStatus: function(){
            //数秒後にステータスを閉じる
            clearTimer_readStatus();
            readStatusClearTimer = setTimeout(function(){clearReadStatus();},5000);
        },
        displayed_fileloadStatus :function(){
          $(".readDisp").removeClass("hidden");
        },
        selectFileStatus: function(inStr){
            if(inStr != ""){
              $(".selectFileStatus").html('<p class="selectFileStatusMes"><i class="fa fa-fw fa-plus-square"></i>&nbsp;'+inStr+"</p>");
            }else{
              $(".selectFileStatus").html('');
            }
            //数秒後にステータスを閉じる
            clearTimer_selectFileStatus();
            selectFileStatusClearTimer = setTimeout(function(){clearSelectFileStatus();},2500);
            //アニメーション
            $(".selectFileStatusMes").animate({"margin-left":"20px","opacity": "0.0"}, 0)
            .animate({ "margin-left":"0px","opacity": "1.0"}, 200)
            .delay(2000).animate({ opacity: "0.0"}, 300);
        },
        displayed_selectFileStatus :function(){
          $(".selectFileStatus").removeClass("hidden");
        }

    };
})();