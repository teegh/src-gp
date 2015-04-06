//押されたキーを取得する
//但しブラウザにより、上手く取得できないケースもあるかもしれないので注意
//http://javascriptist.net/docs/pract_keyboard_event.html
//http://d.hatena.ne.jp/KEINOS/20120117
//
//非アクティブの状態でクリックすると、キープレスの状態を取得できない
var _KeyDown = (function() {

    var shift=false,
        ctrl=false,
        keycode="",
        keychar="";

    function pressCheck(e) {


        // Mozilla(Firefox, NN, chromeも?) and Opera
        if (e != null) {
            keycode = e.which;
            ctrl    = typeof e.modifiers == 'undefined' ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK;
            shift   = typeof e.modifiers == 'undefined' ? e.shiftKey : e.modifiers & Event.SHIFT_MASK;
            // イベントの上位伝播を防止
            // e.preventDefault();
            // e.stopPropagation();
        // Internet Explorer
        } else {
            keycode = event.keyCode;
            ctrl    = event.ctrlKey;
            shift   = event.shiftKey;
            // イベントの上位伝播を防止
            // event.returnValue = false;
            // event.cancelBubble = true;
        }

        // キーコードの文字を取得
        keychar = String.fromCharCode(keycode).toUpperCase();

        // $(".debugTemp").html("キーイベント： c:" + ctrl + " /s:" + shift + " /code:" + keycode);

        // 特殊キーコードの対応については次を参照
            // 27   Esc
            // 8    BackSpace
            // 9    Tab
            // 32   Space
            // 45   Insert
            // 46   Delete
            // 35   End
            // 36   Home
            // 33   PageUp
            // 34   PageDown
            // 38   ↑
            // 40   ↓
            // 37   ←
            // 39   →
        // 処理の例
        // if (keycode == 27) {
        //  alert('Escapeキーが押されました');
        // }
    }

    //イベント登録
    document.onkeydown = pressCheck;
    document.onkeyup = pressCheck;

    return {
        isPress_shift : function(){
            return shift;
        },
        isPress_ctrl : function(){
            return ctrl;
        },
        pressKey : function(){
            return keychar;
        },
        init : function(){
            //初期化：ウインドウがアクティブから非アクティブに変わったときに実行する。
            shift = false;
            ctrl = false;
            keychar = "";
        }
    };

})();