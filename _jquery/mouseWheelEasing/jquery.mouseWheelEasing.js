//出典：http://www.webopixel.net/javascript/435.html

// 以下が必要
// jquery.easie.js
// jquery.mousewheel.js

// bowerで取得可能。
//=require ../../_bower/jquery.easie.js/js/jquery.easie.js
//=require ../../_bower/jquery-mousewheel/jquery.mousewheel.js

$(function() {
    var scrolly = 0;
    var speed = 200;
    $('html').mousewheel(function(event, mov) {
        if(jQuery.browser.webkit){
            if (mov > 0) scrolly =  $('body').scrollTop() - speed;
            else if (mov < 0) scrolly =  $('body').scrollTop() + speed;
        } else {
            if (mov > 0) scrolly =  $('html').scrollTop() - speed;
            else if (mov < 0) scrolly =  $('html').scrollTop() + speed;
        }
        $('html,body')
            .stop()
            .animate({scrollTop: scrolly}, 'fast',$.easie(0,0,0,1.0));
            //イージングプラグイン使わない場合
            // .animate({ scrollTop: scrolly }, 'normal');
        return false;
    });
});