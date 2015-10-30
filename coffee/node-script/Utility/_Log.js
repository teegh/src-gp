//コンソールログに関するモジュール
//_RepStrUtilが必要

var _Log = (function(){//jquery closure
  
  var _filterModuleName = []; //ログとして表示するモジュール名
  var _isVisibleDate = true;  //ログに日付を表示
  
  //get color
  function gC(inColorName){
    if(inColorName == "black"){
      return '\u001b[30m';
    }else if(inColorName == "red"){
      return '\u001b[31m';
    }else if(inColorName == "green"){
      return '\u001b[32m';
    }else if(inColorName == "yellow"){
      return '\u001b[33m';
    }else if(inColorName == "blue"){
      return '\u001b[34m';
    }else if(inColorName == "magenta"){
      return '\u001b[35m';
    }else if(inColorName == "cyan"){
      return '\u001b[36m';
    }else if(inColorName == "white"){
      return '\u001b[37m';
    }else{
      return '\u001b[0m';
    }
  }
  
  //日時を取得する
  function getDateTimeStr(){
    var weeks = new Array('日','月','火','水','木','金','土');
    var now = new Date();

    var year = now.getYear(); // 年
    var month = now.getMonth() + 1; // 月
    var day = now.getDate(); // 日
    var week = weeks[ now.getDay() ]; // 曜日
    var hour = now.getHours(); // 時
    var min = now.getMinutes(); // 分
    var sec = now.getSeconds(); // 秒

    if(year < 2000) { year += 1900; }

    // 数値が1桁の場合、頭に0を付けて2桁で表示する指定
    if(month < 10) { month = "0" + month; }
    if(day < 10) { day = "0" + day; }
    if(hour < 10) { hour = "0" + hour; }
    if(min < 10) { min = "0" + min; }
    if(sec < 10) { sec = "0" + sec; }

    // 表示開始
    // document.write('現在：<strong>' + year + '年' + month + '月' + day + '日（' + week + '）');
    // document.write(hour + '時' + min + '分' + sec + '秒</strong>');
    return year+"/"+month+"/"+day+" "+hour+":"+min+":"+sec;
  }
  
  return {
    log : function (inModuleName, isError , title , message){
        // var em = isError ? "Error " : "";
        
        var consoleVidible = true;
        if(_filterModuleName && _filterModuleName.length > 0){
          consoleVidible = false;
          for(var i=0; i<_filterModuleName.length; i++){
            if(_filterModuleName[i] == inModuleName){
              consoleVidible = true;
              break;
            }
          }
        }
        
        if(consoleVidible){
          var m = _RepStrUtil.Rep_SpacePaddingString(inModuleName , 16);
          var t = _RepStrUtil.Rep_SpacePaddingString(title , 16);
          var dStr = _isVisibleDate ? getDateTimeStr() : "";
          
          if(!isError){
            console.log(" " + dStr + " " + gC("cyan") + m +gC() + gC("white") + t + gC() + message);
          }else{
            console.error(" " + gC("red") +dStr +" "+ gC("cyan")+ m + gC() + gC("white")+ t + gC()  + gC("red")+message + gC());
          }
        }
        
    },
    
    //ログとして表示したいモジュール名を指定する。例 ["module",...]
    setFilterModuleName : function(inFilterArr){
      _filterModuleName = inFilterArr;
    },
    
    //ログに日付を表示
    isVisibleDate : function (inFlg){
      _isVisibleDate = inFlg;
    }
    
    
  };
})();//jQuery Closure
