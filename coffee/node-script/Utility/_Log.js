//コンソールログに関するモジュール
//_RepStrUtilが必要

var _Log = (function(){//jquery closure
  
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
  
  
  return {
    log : function (inModuleName, isError , title , message){
        // var em = isError ? "Error " : "";
        
        var m = _RepStrUtil.Rep_SpacePaddingString(inModuleName , 16);
        var t = _RepStrUtil.Rep_SpacePaddingString(title , 16);
        
        
        if(!isError){
          console.log(" " + gC("cyan")+ m +gC() + gC("white") + t + gC() + message);
        }else{
          console.error(" " + gC("cyan")+ m + gC() + gC("white")+ t + gC()  + gC("red")+message + gC());
        }
        
    }
  };
})();//jQuery Closure
