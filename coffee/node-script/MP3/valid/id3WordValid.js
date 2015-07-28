//---------------------------------------------------
// ID3タグの内容を判定する。
//---------------------------------------------------
// id3v2 writer
var _ID3WordValid = (function(){  //jquery closure
// var _ID3WordValid = new function(){  //node app

  //-----------------------------------------
  //ID3フレーム以降のデータを抽出
  //-----------------------------------------
  function orgfunc(){

  }

  return {

    //年代の入力形式
    isYear : function (inStr){
      var retFlg = false;
      if(inStr.match(/^[0-9][0-9][0-9][0-9]\/[0-9][0-9]\/[0-9][0-9]$/))retFlg = true;
      if(inStr.match(/^[0-9][0-9][0-9][0-9]$/))retFlg = true;
      return retFlg;
    },

    //ファイル名とid3のタイトル名は同じ
    isSame_FileNameAndId3Titile : function (inFileName, inID3Title){
      if(inID3Title == inFileName.replace(/^[0-9][0-9] - /i,"")){
        return true;
      }else{
        return false;
      }
    },

    //空文字、null
    isNotNull : function(inStr){
      if(inStr == undefined || inStr == null || inStr == ""){
        return false;
      }else{
        return true;
      }
    },

    //前後のスペース
    isNotSpaceLR : function(inStr){
      if(inStr.match(/(^[ 　])|([ 　]$)/g)){
        return false;
      }else{
        return true;
      }
    },

    //特殊な空白
    isNotAnotherSpace : function(inStr){
      var regStr = "["+ String.fromCharCode(0x2002)
          + String.fromCharCode(0x2003)
          + String.fromCharCode(0x2004)
          + String.fromCharCode(0x2005)
          + String.fromCharCode(0x2009)
          + String.fromCharCode(0x2006)
          + String.fromCharCode(0x2007)
          + String.fromCharCode(0x2008)
          + String.fromCharCode(0x200A)
          + String.fromCharCode(0x200B)
          + String.fromCharCode(0x3000)
          + String.fromCharCode(0xFEFF)
          + String.fromCharCode(0x0009)
          + "]";
      var regex = new RegExp(regStr , "g");
      if(inStr.match(regex)){
        return false;
      }else{
        return true;
      }
    },

    //一部の全角記号
    isNotZenkakuKigo : function(inStr){
      if(inStr.match(/[＆‐―－’，．]/g)){
        return false;
      }else{
        return true;
      }
    },

    //一部の半角記号
    isNotHankakuKigo : function(inStr){
      //半角記号。チェック除外文字：',.&-
      if(inStr.match(/[)(=･"!#$%\\*+\/:;<>?@[\]^_`{|}~｡｢｣､]/g)){
        return false;
      }else{
        return true;
      }
    },

    //全角英数字
    isNotZenkaku : function(inStr){
      if(inStr.match(/[１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ]/g)){
        return false;
      }else{
        return true;
      }
    },

    //ファイルのトラック番号
    isTrackNo : function(inStr){
      if(inStr.match(/^[0-9][0-9] - /g)){
        return true;
      }else{
        return false;
      }
    },

    //全角の3点リーダ
    isDotted : function(inStr){
      if(inStr.match(/…/g)){
        return false;
      }else{
        return true;
      }
    },

    //機種依存文字
    isPlatformDependent : function(inStr){
      var retFlg = true;

      if(inStr.match(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪]/g))retFlg = false;
      if(inStr.match(/[纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙]/g))retFlg = false;
      if(inStr.match(/[晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇]/g))retFlg = false;
      if(inStr.match(/[菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑ⅰⅱⅲⅳⅴⅵⅶⅷⅸ]/g))retFlg = false;
      if(inStr.match(/[ⅹ￢￤＇＂￢￤＇＂㈱№㏍℡]/g))retFlg = false;

      return retFlg;
    }
  };


})();    //jQuery Closure
// };          //node.js