//---------------------------
// KVSの入出力
//---------------------------
//依存：
//localforage.js
//(=require ../../../../src/_bower/localforage/dist/localforage.js)
//
var _KVS = (function(){

  return {
    setKVS: function (inKey, inValue){
        localforage.setItem( inKey, inValue, function(err,value){
            // $(".console1").text("入力データ :" + value);
        } );
    },
    setKVS_func: function (inKey, inValue, inFunc){
        localforage.setItem( inKey, inValue, inFunc );
    },
    getValue: function(inKey , inFunc){
        localforage.getItem( inKey, inFunc);
        //inFunc 例
        // function(err,value){
        //     if (!value) {
        //         // $(".console2").text("読み取り失敗:(err)"+err);
        //         alert("取得できません");
        //         return null;
        //     } else {
        //         // $(".console2").text("読み取りデータ: "+ value);
        //         alert("取得できした！");
        //         return value;
        //     }
        // }
    },
    deleteValue: function(inKey, inFunc){
        localforage.removeItem(inKey,inFunc);
    },
    clearKVS : function(){
        localforage.clear(function(e){alert("KVSを削除しました。");});
    }
  };

})();