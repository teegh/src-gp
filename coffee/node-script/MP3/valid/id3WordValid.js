//---------------------------------------------------
// ID3タグの内容を判定する。
//---------------------------------------------------
// id3v2 writer
var _ID3WordValid = (function(){  //jquery closure
// var _ID3WordValid = new function(){  //node app


  function getTrackStr(inTrack){
    if(Number(inTrack) < 10){
      return "0" + String(inTrack);
    }else{
      return inTrack;
    }
  }

  function getMatchString(inMatchArr){
    var retStr = "";
    for(var i=0; i<inMatchArr.length; i++){
      if(retStr != "")retStr += " と ";
      retStr += inMatchArr[i];
    }
    return retStr;
  }

  return {

    //年代の入力形式
    isYear : function (inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      if(targStr.match(/^[0-9][0-9][0-9][0-9]\/[0-9][0-9]\/[0-9][0-9]$/))retFlg = true;
      if(targStr.match(/^[0-9][0-9][0-9][0-9]$/))retFlg = true;
      if(!retFlg)mes = "「YYYY」または「YYYY/MM/DD」の形式になっていません。";
      return mes;
    },

    //ファイル名とid3のタイトルが一致しているか否か
    isSame_FileNameAndId3Titile : function (inFileName, inID3Title){
      var retFlg = false;
      var mes = "";
      var fileN = inFileName.replace(/^[0-9][0-9] - /i , "");

      if(fileN == inID3Title){
        retFlg =  true;
      }else{
        retFlg =  false;
      }
      if(!retFlg)mes = "ファイル名に含まれるタイトルと曲名が一致しません。同じ内容にしてください。";
      return mes;
    },

    //ファイル名に含まれるトラック番号とトラックが一致しているか否か
    isSame_FileNameTrackAndId3Track : function (inFileName, inTrack){
      var retFlg = false;
      var mes = "";
      var fileN = inFileName.replace(/^[0-9][0-9] - /i , "");
      var trackStr = inFileName.replace(fileN,"");

      if(trackStr == getTrackStr(inTrack) + " - "){
        retFlg =  true;
      }else{
        retFlg =  false;
      }
      if(!retFlg)mes = "ファイル名が「NN - 」の形式になっていません。または、ファイル名に含まれるトラック番号とトラックが一致しません。同じ内容にしてください。";
      return mes;
    },



    //ファイル名とファイルパスに含まれるファイル名が一致しているか否か
    //var oldFilePath = path.normalize(inFilePath);
    //var newFilePath = oldFilePath.replace(path.basename(oldFilePath),"") + inNewFileName + path.extname(oldFilePath);
    isSame_FileNameAndFilePath : function (inNewFilePath, inOldFilePath){
      var retFlg = false;
      var mes = "";

      if(inNewFilePath == inOldFilePath){
        retFlg =  true;
      }else{
        retFlg =  false;
      }
      if(!retFlg)mes = "ファイル名と、ファイル場所に含まれるファイル名が一致しません。ただし、ファイル名を新たに変更したい場合は問題ありません。";
      return mes;
    },



    //ファイル名に入力できない記号があるか否か
    isFileNameProhibitedCharacters : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      var matchArr = targStr.match(/[\\\/:*\?"<>|]/g);
      if(matchArr){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "ファイル名として入力できない記号 " + getMatchString(matchArr) +" があります。全角文字や別の文字に置き換えてください。";
      return mes;
    },


    //ファイルの長さが256以上となっている
    isFileNameLength : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      if(targStr.length >= 256){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "ファイルパスが長すぎます。短いファイル名に変更するか、ファイルの場所を移動させてください。";
      return mes;
    },

    //数字か否か
    isNumeric : function (inStr){
      var mes = "";
      if(inStr != String(Number(inStr))){
        mes = "数字のみを入力してください。";
      }
      return mes;
    },

    //ファイルのトラック番号
    isTrackNo : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      if(targStr.match(/^[0-9][0-9] - /g)){
        retFlg = true;
      }else{
        retFlg = false;
      }
      if(!retFlg)mes = "トラック番号が含まれていないか、「NN - 」の形式となっていません。";
      return mes;
    },

    //-------------------------------

    //空文字、null
    isNotNull : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      if(targStr == undefined || targStr == null || targStr == ""){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "データが空です。文字を入力してください。";
      return mes;
    },

    //前後のスペース
    isNotSpaceLR : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      if(targStr.match(/(^[ 　])|([ 　]$)/g)){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "データの左端または右端に空白文字があります。空白は削除してください。";
      return mes;
    },

    //特殊な空白
    isNotAnotherSpace : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
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
      if(targStr.match(regex)){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "特殊な空白があります。削除してください。";
      return mes;
    },

    //一部の全角記号
    isNotZenkakuKigo_yougaku : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      // var matchArr = inStr.match(/[＆‐―－’，．]/g);  // J-POP 現在は判定しない
      var matchArr = targStr.match(/[％＆’‘）（＋，－‐．＝＠［］＾＿｀｛｝「」]/g);  //洋楽

      if(matchArr){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "全角記号 " + getMatchString(matchArr) +" があります。半角記号に置き換えてください。";
      return mes;
    },

    //一部の半角記号
    isNotHankakuKigo : function(inStr){
      //半角記号。チェック除外文字：',.&-
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      // var matchArr = inStr.match(/[)(=･"!#$%\\*+\/:;<>?@[\]^_`{|}~｡｢｣､]/g);
      var matchArr = targStr.match(/[\)\(=･"!#\$%\\*\+\/:;<>\?@\[\]\^_`\{\}\|~｡｢｣､]/g);
      // 洋楽　/[!"#$*\/:;<>?\\\|~｡､]/g

      if(matchArr){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "半角記号 "+ getMatchString(matchArr)+" があります。全角記号に置き換えてください。";
      return mes;
    },

    //一部の半角記号 洋楽
    isNotHankakuKigo_yougaku : function(inStr){
      //半角記号。チェック除外文字：',.&-
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      var matchArr = targStr.match(/[!"#$*\/:;<>?\\\|~｡､]/g); // 洋楽

      if(matchArr){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "半角記号 "+ getMatchString(matchArr)+" があります。全角記号に置き換えてください。";
      return mes;
    },



    //全角英数字
    isNotZenkaku : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      var matchArr = targStr.match(/[１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ]/g);
      if(matchArr){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "全角英数字 "+ getMatchString(matchArr)+" があります。半角英数字に置き換えてください。";
      return mes;
    },

    //全角の3点リーダ
    isDotted : function(inStr){
      var retFlg = false;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";
      if(targStr.match(/…/g)){
        retFlg = false;
      }else{
        retFlg = true;
      }
      if(!retFlg)mes = "…(3点リーダ)があります。半角文字のドット(.)3つに置き換えてください。";
      return mes;
    },

    //機種依存文字
    isPlatformDependent : function(inStr){
      var retFlg = true;

      var targStr = inStr;
      if(targStr == null || targStr == undefined)targStr = "";

      var mes = "";

      var matchArr1 = targStr.match(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪]/g);
      var matchArr2 = targStr.match(/[纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙]/g);
      var matchArr3 = targStr.match(/[晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇]/g);
      var matchArr4 = targStr.match(/[菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑ⅰⅱⅲⅳⅴⅵⅶⅷⅸ]/g);
      var matchArr5 = targStr.match(/[ⅹ￢￤＇＂￢￤＇＂㈱№㏍℡]/g);

      if(matchArr1)retFlg = false;
      if(matchArr2)retFlg = false;
      if(matchArr3)retFlg = false;
      if(matchArr4)retFlg = false;
      if(matchArr5)retFlg = false;

      var matchmes = "";
      if(matchArr1)matchmes += (matchmes != "" ? " と " : "") + getMatchString(matchArr1);
      if(matchArr2)matchmes += (matchmes != "" ? " と " : "") + getMatchString(matchArr2);
      if(matchArr3)matchmes += (matchmes != "" ? " と " : "") + getMatchString(matchArr3);
      if(matchArr4)matchmes += (matchmes != "" ? " と " : "") + getMatchString(matchArr4);
      if(matchArr5)matchmes += (matchmes != "" ? " と " : "") + getMatchString(matchArr5);

      if(!retFlg)mes = "機種依存文字 " +matchmes+ " が含まれています。可能な限り代替できる文字に置き換えてださい。";
      return mes;
    }
  };


})();    //jQuery Closure
// };          //node.js