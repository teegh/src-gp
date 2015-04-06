$.jPrintArea=function(el,printCssFileName){
  try{
    var iframe=document.createElement('IFRAME');
    var doc=null;
    $(iframe).attr('style','position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
    document.body.appendChild(iframe);
    doc=iframe.contentWindow.document;
    var links=window.document.getElementsByTagName('link');
    for(var i=0;i<links.length;i++)
    if(links[i].rel.toLowerCase()=='stylesheet')
    if(links[i].href.indexOf(printCssFileName) != -1)
    doc.write('<link type="text/css" rel="stylesheet" href="'+links[i].href+'" media="print" />');
    // doc.write('<link type="text/css" rel="stylesheet" href="'+links[i].href+'" media="print"></link>');
    doc.write('<div class="'+$(el).attr("class")+'">'+$(el).html()+'</div>');
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    // alert('印刷しています...' + "("+ el +")" + '<div class="'+$(el).attr("class")+'">'+$(el).html()+'</div>');
    // document.body.removeChild(iframe);
  }catch(e){
    alert("error:"+e);
  }
}
