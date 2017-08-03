document.addEventListener('keydown', function(e) {
  if( !MEMORY.game.stop_movement )
  {
    if( e.keyCode == 68 ) //D
    {
      if( !CURRENT_PLAYER.pressingUp && !CURRENT_PLAYER.pressingDown ) 
        MEMORY.player.heightMod = 1;
      socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'right',state:true});
    }
    else if( e.keyCode == 65 ) //A
    {
      if( !CURRENT_PLAYER.pressingUp && !CURRENT_PLAYER.pressingDown ) 
        MEMORY.player.heightMod = 3;
      socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'left',state:true});
    }
    else if( e.keyCode == 83 ) //S
    {
      MEMORY.player.heightMod = 2;
      socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'down',state:true});
    }
    else if( e.keyCode == 87 ) //W
    {
      MEMORY.player.heightMod = 0;
      socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'up',state:true});
    }
  }
});

document.addEventListener('keyup', function(e){
    if( !MEMORY.game.stop_movement )
    {
        if( e.keyCode === 68 ) //d
            socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'right',state:false});
        else if( e.keyCode === 65 ) //a
            socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'left',state:false});
        else if( e.keyCode === 83 ) //s
        {
            if( CURRENT_PLAYER.pressingLeft )
                MEMORY.player.heightMod = 3;
            else if( CURRENT_PLAYER.pressingRight )
                MEMORY.player.heightMod = 1;
            socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'down',state:false});
        }
        else if( e.keyCode === 87 ) //w
        {
            if( CURRENT_PLAYER.pressingLeft )
                MEMORY.player.heightMod = 3;
            else if( CURRENT_PLAYER.pressingRight )
                MEMORY.player.heightMod = 1;
            socket.emit('movementKeyPress',{id:CURRENT_PLAYER.id,inputId:'up',state:false});
        }
    }
});

document.addEventListener('keydown', function(e){
    if( MEMORY.game.chat_focus )
    {
        switch ( e.keyCode )
        {
            //SEND MESSAGE TO SERVER
            case 13: //ENTER
                e.preventDefault();

                if( MEMORY.game.chat.getAttribute('name') == 'game_chat' )
                {
                    let game_chat = document.querySelector("textarea[name=game_chat]");

                    if( game_chat.value.length < 5 && game_chat.value.charAt("0") != "/" )
                    {
                        addChatMsg({from:"SYSTEM",msg:"You should write at least 5 characters.",color:"#00ed00"});
                    }
                    else
                    {
                        if( game_chat.value.charAt("0") == "/" )
                        {
                            let section = game_chat.value;
                            section = section.split('/')[1];

                            switch(section)
                            {
                                case "clear":
                                    let messages = document.querySelectorAll("div#chat > div#msg");

                                    if( messages.length >= 1 )
                                    {
                                        for( let i = 0; i < messages.length; i++ )
                                        {
                                            let msg = messages[i];
                                            msg.parentNode.removeChild(msg);
                                        }
                                    }

                                    addAlertMsg({msg:'Chat successfully cleared.',duration:3, wait:0.2});

                                    MEMORY.game.stop_movement = false;
                                    MEMORY.game.chat_focus    = false;
                                    document.querySelector("textarea[name=game_chat]").blur();
                                    document.querySelector("textarea[name=game_chat]").value = "";
                                    break;

                                default:

                                    socket.emit('addChatMsg',{map_id:CURRENT_PLAYER.current_map_id,msg:game_chat.value,id:CURRENT_PLAYER.id});

                                    MEMORY.game.stop_movement = false;
                                    MEMORY.game.chat_focus    = false;
                                    document.querySelector("textarea[name=game_chat]").blur();
                                    document.querySelector("textarea[name=game_chat]").value = "";

                                    break;
                            }
                        }
                        else
                        {
                            socket.emit('addChatMsg',{map_id:CURRENT_PLAYER.current_map_id,msg:game_chat.value,id:CURRENT_PLAYER.id});

                            MEMORY.game.stop_movement = false;
                            MEMORY.game.chat_focus    = false;
                            MEMORY.game.chat.blur();
                            document.querySelector("textarea[name=game_chat]").value = "";
                        }
                    }
                }

            break;

            case 27: //ESC
                MEMORY.game.stop_movement = false;
                MEMORY.game.chat_focus    = false;
                MEMORY.game.chat.blur();
                if( MEMORY.game.chat.getAttribute('name') == 'game_chat' )
                    document.querySelector("textarea[name=game_chat]").value = "";
            break;
        }
    }
    else
    {
        switch ( e.keyCode )
        {
            case 13: //ENTER
                e.preventDefault();
                if( MEMORY.game.settings.show_chat != 0 )
                {
                    MEMORY.game.stop_movement = true;
                    MEMORY.game.chat_focus    = true;
                    document.querySelector("textarea[name=game_chat]").focus();
                }
            break;
        }
    }
});

setInterval(function(){
    var textareas = document.getElementsByTagName('textarea');

    for( let i=0; i < textareas.length; i++ )
    {
        let textarea = textareas[i];

        textarea.onfocus = function(){
            MEMORY.game.chat = this;

            MEMORY.game.stop_movement = true;
            MEMORY.game.chat_focus    = true;
        }

        textarea.onblur = function(){
            MEMORY.game.stop_movement = false;
            MEMORY.game.chat_focus    = false;
        }
    }
}, FPS);

window.addEventListener('resize', function(e){
    //console.log("RESIZE");
});

$(function(){
    /*
     * Mouse Block
     * */
    var permitted_nodes = ['input','select','option','textarea','label'];
    $("div#game-ui").on('click',function(e){


    });
    $("div#game-ui").on('mousedown',function(e){
        if( $.inArray( e.target.nodeName.toLowerCase(), permitted_nodes ) === -1 )
            e.preventDefault();
    });

    /*
     * GAME CHAT
     * */
    $("textarea[name=game_chat]").on('click',function(){
        MEMORY.game.stop_movement = true;
        MEMORY.game.chat_focus    = true;
        this.focus();
    });
});