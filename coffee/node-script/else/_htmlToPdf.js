var _HTMLtoPDF = (function(){

  var pdf   = require('html-pdf');
  var fs    = require('fs');
  var nPath = require('path');
  var html  = "";

  function makePDF_cmd(inFilePath , inBodyHTML, inStyle, inLinkStr, inOption , inCallBackFunction){

        // var printCSSPathArr = getPrintCssPath("print.css");
        // var cssStr = "";
        // if(printCSSPathArr.length > 0)cssStr = fs.readFileSync("./asset/print.css",'utf8');
        // $(".debug").text(nPath.normalize(printCSSPathArr[0]) );

        html = "";
        html += '<html><head><meta charset="utf8"><title>print</title>';
        html += inLinkStr;
        html += '<style>' + inStyle + '</style>';

        html += '</head><body>';
        html += inBodyHTML;
        html += '</body></html>';

        var options = inOption;
        pdf.create(html,options).toFile(inFilePath,function(err, res){
          if (err)inCallBackFunction('error',err, res);
          if (!err)inCallBackFunction('success',err, res);
        });
  }


  return {
    makePDF : function(inFilePath , inBodyHTML, inStyle, inLinkStr, inOption, inCallBackFunction) {
      //(exaple)
      // inFilePath : c:/...
      // inBodyHTML : <div class="pWrapper">pdfArea</div>
      // inStyle : 下記
      // inOption : { "width": '2100px', "height":"2970px" }
      //C:/Users/usen V-2/Desktop/録音/fooa.pdf
      //{ "width": '2100px', "height":"2970px" }
      makePDF_cmd(inFilePath , inBodyHTML, inStyle, inLinkStr, inOption, inCallBackFunction);
    }
  };

})();


//スタイルの例
// @media print{
//   html{
//     background-color: #CAC;
//     width:2100px;
//   }
//   body {
//     font-size: 12pt;
//     color: #000000;
//     background-color: #fff;
//     width:2100px;
//     padding:0;
//     margin:0;
//   }
//   a:link,
//   a:visited {
//     text-decoration: underline;
//     color: #000000;
//   }

//   img {
//     border: 0;
//   }
//   .pWrapper{
//     width:2100px;
//     height:2970px;
//     page-break-after: always;
//   }
//   .pContainer{
//     padding:90px 0 0 0;
//     margin:0 90px;
//     background-color: #ccc;
//   }
//   .labelBox{
//     width:620px;
//     height:310px;
//     float:left;
//     background-color: #2C2;
//   }
//   .labelBox-red{
//     width:620px;
//     height:310px;
//     float:left;
//     background-color: #C22;
//   }
//   .labelBox-margin{
//     width:30px;
//     height:310px;
//     float:left;
//     background-color: #22C;
//   }
// }