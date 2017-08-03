const CONNECTION = {
    url  : 'localhost',
    port : 6969
};
const socket = io(CONNECTION.url+':'+CONNECTION.port);
const DEFAULT = {
    game:{
        settings:{
            show_names: 1, //player names
            player_name_color:'#ff0000',
            show_chat : 1
        }
    }
};
const LOADING_IMG = new Image();
LOADING_IMG.src = 'assets/site/loader.gif';

$(function(){
    var allow_click = true;
    $("button#login").on('click',function(){
        if( allow_click )
        {
            allow_click = false;
            let username = $('input[name=kadi]').val();
            let password = $('input[name=sifre]').val();
            let HIDE_TIME = 0; //second

            socket.emit('loginRequest', {username:username,password:password});
            socket.on('loginResponse', function(data){
                if( data.code == 1 )
                {
                    PLAYER_ALL_DATA = data.player_data;
                    PLAYER_ALL_DATA.username    = username;
                    PLAYER_ALL_DATA.max_player  = data.max_player;
                    PLAYER_ALL_DATA.user_id     = data.user_id;

                    $("span#return-data").attr("data","1");
                    $("span#return-data").html(data.msg);
                    $("span#return-data").stop().fadeIn(350);
                    setTimeout(function(){
                        $("span#return-data").stop().fadeOut(350);
                        $("div#game-login").remove();

                        //## Character Select ##//
                        MEMORY = {game : {allowAjax:true}};
                        loadGame('character_select');

                        //GAME STARTS AT "character_select.html".
                    },HIDE_TIME*1000);

                    //Create local storage
                    if( !checkLocalStorage(['username']) )
                        localStorage.setItem('username', username);

                    if( $('#remember-pw:checked').length == 1 )
                    {
                        if( !checkLocalStorage(['password']) )
                            localStorage.setItem('password', password);
                    }
                    else
                    {
                        localStorage.removeItem('password');
                    }
                }
                else if( data.code == 0 )
                {
                    $("span#return-data").attr("data","0");
                    $("span#return-data").html(data.msg);
                    $("span#return-data").stop().fadeIn(350);
                    setTimeout(function(){
                        $("span#return-data").stop().fadeOut(350);
                    },HIDE_TIME*1000);
                    allow_click = true;
                }
            });
        }
    });

    $("body").mCustomScrollbar({
        theme:'inset-3',
        axis:'yx',
    });

    socket.on('disconnect',function(data){
        if( GAME_STATUS == 1 )
            closeGame('Sunucuyla baglanti koptu. <a href="#" onclick="location.reload()" style="color:purple;text-decoration: none;">Yenile</a>');
    });
});

if( !localStorage.getItem('game_settings') )
{ createDefaultGameSettings(); }

function checkLocalStorage(cols=[], func=function(){} )
{
    let total_count = cols.length;
    let counter     = 0;

    for( let i in cols )
    {
        if( localStorage.getItem(cols[i]) )
            counter++;
    }

    if( counter === total_count )
        func();
    else
        return false;
}

function createDefaultGameSettings(){
    let data = {
        show_names : DEFAULT.game.settings.show_names,
        player_name_color: DEFAULT.game.settings.player_name_color,
        show_chat : DEFAULT.game.settings.show_chat
    };

    localStorage.setItem('game_settings',JSON.stringify(data));
}


function selectPlayer(dom)
{
    let index = dom.getAttribute('index');
    
    socket.emit('selectCharacter',{index:index,user_id:PLAYER_ALL_DATA.user_id});

    $('#selection-screen').html('<img src="assets/site/loader.gif" id="loader" style="margin: 0 auto;margin-top:15px;display: block;width: 50px;height: 50px;"><br/><span style="text-align: center;display: block;margin-bottom: 5px;">Game Loading..</span>');
}

socket.on('ResponseSelectCharacter',function(data){
    if( data.code == 1 )
    {
        CURRENT_PLAYER = data.player_data;
        loadGame('main');
    }
    else if( data.code == 0 )
    {
        alert('An error occured.');
        location.reload();
    }
});