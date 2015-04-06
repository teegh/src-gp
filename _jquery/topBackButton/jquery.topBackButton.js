//出典：http://www.webopixel.net/javascript/538.html

// <p id="page-top"><a href="#wrap">PAGE TOP</a></p>
// #page-top {
//     position: fixed;
//     bottom: 20px;
//     right: 20px;
//     font-size: 77%;
// }
// #page-top a {
//     background: #666;
//     text-decoration: none;
//     color: #fff;
//     width: 100px;
//     padding: 30px 0;
//     text-align: center;
//     display: block;
//     border-radius: 5px;
// }
// #page-top a:hover {
//     text-decoration: none;
//     background: #999;
// }

// 1.ちょっとスクロールしたら「トップへ戻るボタン」を表示
// 「100」というのが出現位置になるので適当に変更してください。
// $(function() {
//     var topBtn = $('#page-top');
//     topBtn.hide();
//     //スクロールが100に達したらボタン表示
//     $(window).scroll(function () {
//         if ($(this).scrollTop() > 100) {
//             topBtn.fadeIn();
//         } else {
//             topBtn.fadeOut();
//         }
//     });
//     //スクロールしてトップ
//     topBtn.click(function () {
//         $('body,html').animate({
//             scrollTop: 0
//         }, 500);
//         return false;
//     });
// });

//2.スライドアニメーションして表示
//先ほどの「トップへ戻るボタン」を下からにょきっとアニメーションして表示したらかっこいいかもしれない。
$(function() {
    var showFlag = false;
    var topBtn = $('#page-top');
    topBtn.css('bottom', '-100px');
    var showFlag = false;
    //スクロールが100に達したらボタン表示
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            if (showFlag == false) {
                showFlag = true;
                topBtn.stop().animate({'bottom' : '20px'}, 200);
            }
        } else {
            if (showFlag) {
                showFlag = false;
                topBtn.stop().animate({'bottom' : '-100px'}, 200);
            }
        }
    });
    //スクロールしてトップ
    topBtn.click(function () {
        $('body,html').animate({
            scrollTop: 0
        }, 500);
        return false;
    });
});