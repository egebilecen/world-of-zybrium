__LETS_GO__  = false;

var __aqwt = setInterval(function(){
    if( __RESOURCE_INIT__ )
    {
        socket.on('responseGetNewPlayerPositions',function(data){
            let __IMG_RESOURCE_COUNTER__ = 0;
            let playerCounter = 0;
            PLAYER_LIST = data;

            for( let i in PLAYER_LIST )
            {
                let player = PLAYER_LIST[i];
                
                if( !MEMORY.game.entityImage[player.id] )
                {
                    MEMORY.game.entityImage[player.id] = {
                        img : {
                            face:null,
                            hair:null,
                            body:null,
                            armor:null,
                            helmet:null
                        },
                        isLoaded : {
                            face:false,
                            hair:false,
                            body:false,
                            armor:false,
                            helmet:false
                        },
                        inventory_equipped : {
                            face  : player.inventory_equipped.face,
                            hair  : player.inventory_equipped.hair,
                            body  : player.inventory_equipped.body,
                            armor : player.inventory_equipped.armor,
                            helmet : player.inventory_equipped.helmet
                        }
                    };

                    //face
                    let image_face  = new Image();
                    image_face.src  = player.skins_data.face;

                    MEMORY.game.entityImage[player.id].img.face = image_face;

                    image_face.onload=function(){
                        MEMORY.game.entityImage[player.id].isLoaded.face = true;
                    }

                    //hair
                    if( typeof player.skins_data.hair != 'undefined' && player.skins_data.hair != null )
                    {
                        let image_hair  = new Image();
                        image_hair.src  = player.skins_data.hair;

                        MEMORY.game.entityImage[player.id].img.hair = image_hair;

                        image_hair.onload=function(){
                            MEMORY.game.entityImage[player.id].isLoaded.hair = true;
                        }
                    }
                    else
                    {
                        MEMORY.game.entityImage[player.id].img.hair = null;
                        MEMORY.game.entityImage[player.id].isLoaded.hair = true;
                    }

                    //body
                    let image_body  = new Image();
                    image_body.src  = player.skins_data.body;

                    MEMORY.game.entityImage[player.id].img.body = image_body;

                    image_body.onload=function(){
                        MEMORY.game.entityImage[player.id].isLoaded.body = true;
                    }

                    //armor
                    if( typeof player.skins_data.armor != 'undefined' && player.skins_data.armor != null )
                    {
                        let image_armor  = new Image();
                        image_armor.src  = player.skins_data.armor;

                        MEMORY.game.entityImage[player.id].img.armor = image_armor;

                        image_armor.onload=function(){
                            MEMORY.game.entityImage[player.id].isLoaded.armor = true;
                        }
                    }
                    else
                    {
                        MEMORY.game.entityImage[player.id].img.armor = null;
                        MEMORY.game.entityImage[player.id].isLoaded.armor = true;
                    }

                    //helmet
                    if( typeof player.skins_data.helmet != 'undefined' && player.skins_data.helmet != null )
                    {
                        let image_helmet  = new Image();
                        image_helmet.src  = player.skins_data.helmet;

                        MEMORY.game.entityImage[player.id].img.helmet = image_helmet;

                        image_helmet.onload=function(){
                            MEMORY.game.entityImage[player.id].isLoaded.helmet = true;
                        }
                    }
                    else
                    {
                        MEMORY.game.entityImage[player.id].img.helmet = null;
                        MEMORY.game.entityImage[player.id].isLoaded.helmet = true;
                    }
                }
                else if( MEMORY.game.entityImage[player.id].img_path != player.img )
                {
                    MEMORY.game.entityImage[player.id].img_path = player.img;
                }

                playerCounter++;
            }
            PLAYER_COUNT = playerCounter;

            CURRENT_PLAYER = PLAYER_LIST[CURRENT_PLAYER.id];
            delete PLAYER_LIST[CURRENT_PLAYER.id];

            //--[ Create MEMORY Values
            for( let i in PLAYER_LIST )
            {
                let player = PLAYER_LIST[i];

                if (!MEMORY.game.entityAnimationData[player.id]) 
                {
                    MEMORY.game.entityAnimationData[player.id] = {
                        widthMod: 1,
                        heightMod: 2,
                        frameCount: 0
                    }
                }
                else
                {
                    if( player.pressingUp )
						MEMORY.game.entityAnimationData[player.id].heightMod = 0;
					else if( player.pressingDown )
						MEMORY.game.entityAnimationData[player.id].heightMod = 2;
					else if( player.pressingLeft && ( !player.pressingUp && !player.pressingDown ) )
						MEMORY.game.entityAnimationData[player.id].heightMod = 3;
					else if( player.pressingRight && ( !player.pressingUp && !player.pressingDown ) )
						MEMORY.game.entityAnimationData[player.id].heightMod = 1;
                }
            }

            __LETS_GO__ = true;
        });

        $('#game-ui').fadeIn(350);
        clearInterval(__aqwt);

        console.info('GAME STARTED!');
    }
}, 1000/FPS);

//
// Player Walking Animation Settings
//
MEMORY.player.widthMod = 1;
MEMORY.player.heightMod  = 2;
MEMORY.player.frameCount = 0;

setInterval(function(){
    if( __RESOURCE_INIT__ && __LETS_GO__ )
    {
        clearCanvas('entity');

        //--[ Draw Player
        draw('player', PLAYER_LIST, 1);
        draw('player', {1:CURRENT_PLAYER}, 0);

        //--[ Draw Map
        CURRENT_MAP.x = canvas_settings.width/2  - CURRENT_PLAYER.x;
        CURRENT_MAP.y = canvas_settings.height/2 - CURRENT_PLAYER.y;

        draw(
            'map',
            [
                CURRENT_MAP.IMG,
                CURRENT_MAP.zoom_width,
                CURRENT_MAP.zoom_height,
                CURRENT_MAP.zoom_yon,
                CURRENT_MAP.x,CURRENT_MAP.y, //x,y
                CURRENT_MAP.IMG2
            ]
        );
    }
},1000/60);

socket.on('responseAddChatMsg',function(data){
    let from  = data.from;
    let msg   = data.msg;
    let color = data.color;

    msg  = msg.replaceArray(
            SMILES.list,
            [
                '<img src="'+SMILES.source[0]+'" id="smile">',
                '<img src="'+SMILES.source[1]+'" id="smile">',
                '<img src="'+SMILES.source[2]+'" id="smile">',
                '<img src="'+SMILES.source[3]+'" id="smile">',
                '<img src="'+SMILES.source[4]+'" id="smile">',
                '<img src="'+SMILES.source[5]+'" id="smile">',
                '<img src="'+SMILES.source[6]+'" id="smile">',
                '<img src="'+SMILES.source[7]+'" id="smile">',
                '<img src="'+SMILES.source[8]+'" id="smile">'
            ]
        );

    addChatMsg({from:from, msg:msg, color:color});
});

socket.on('responsePlayerUnequipItem',function(data){
    if( data.img )
        MEMORY.game.entityImage[data.playerID].img[data.item] = null;

    if( data.playerID == CURRENT_PLAYER.id )
    {
        setTimeout( () => {
            refreshInventory();
        },100 );
    }

    unequip_lock = false;
});

socket.on('responsePlayerEquipItem',function(data){
    if( data.img )
    {
        let img = new Image();
        img.src = data.img_link;
        img.onload = () => {
            MEMORY.game.entityImage[data.playerID].img[data.item] = img;
        }
    }

    if( data.playerID == CURRENT_PLAYER.id )
    {
        setTimeout( () => {
            refreshInventory();
        },100 );
    }

    equip_lock = false;
});