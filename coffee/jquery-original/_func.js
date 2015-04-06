$(function(){

  //tootltip
  $("[data-toggle=tooltip]").tooltip({
    placement:'bottom'
  });
  $("[data-toggle=popover]").popover();


  // smooth scroll
  // メニュー分位置をずらす。
  $('.navbar-nav > li').click(function(event) {
    event.preventDefault();
    var target = $(this).find('>a').prop('hash');

    var targetPoint = $(target).offset().top-80;
    if(targetPoint < 0)targetPoint = 0;

    $('html, body').animate({
      scrollTop: targetPoint
    }, 800);
  });


  //scrollspy refresh
  $('[data-spy="scroll"]').each(function () {
    var $spy = $(this).scrollspy('refresh')
  });
  $(window).resize(function() {
    $('[data-spy="scroll"]').each(function () {
      $(this).scrollspy('refresh');
    });
  });


  //PrettyPhoto
  $("a.preview").prettyPhoto({
    social_tools: false
  });

  //navbar collapse menu close button
  $("a.closeMenu").on('click',function(){
    //クラス名を取得。
    var attrCollaple    = $('.collapse').attr('class');
    var attrCollapleArr = attrCollaple.split(" ");

    //コラプスが開いている時だけ、閉じる (開いている時はクラスにinが加わる)
    if(attrCollapleArr[attrCollapleArr.length-1] == "in"){
      $('.collapse').collapse('hide');
    }
  });

  //sticky-kit
  $(".sticky-wrapper").stick_in_parent();

  //razyload
  // $("img").lazyload();
});
