//--[ Canvas Settings
const canvas_settings = {
  width:1312,
  height:608,
  border:0,
  border_color:'#777'
};
const GAME_VERSION = 'v0.0.0(pre-ALPHA)';

const game_main = document.getElementById('game-main');
    game_main.style.width  = canvas_settings.width+"px";
    game_main.style.height = canvas_settings.height+"px";

const game_ui = document.getElementById('game-ui');
    game_ui.style.width  = canvas_settings.width+"px";
    game_ui.style.height = canvas_settings.height+"px";

const canvas = document.getElementById('map-canvas');
    canvas.width  = canvas_settings.width;
    canvas.height = canvas_settings.height;
    canvas.onclick=function(e){e.preventDefault();};
    if( canvas_settings.border == 1 )
        canvas.style.border = '1px solid '+canvas_settings.border_color;

const canvas2 = document.getElementById('entity-canvas');
    canvas2.width  = canvas_settings.width;
    canvas2.height = canvas_settings.height;
    canvas2.onclick=function(e){e.preventDefault();};
    if( canvas_settings.border == 1 )
        canvas2.style.border = '1px solid '+canvas_settings.border_color;

const canvas3 = document.getElementById('layer-canvas');
    canvas3.width  = canvas_settings.width;
    canvas3.height = canvas_settings.height;
    canvas3.onclick=function(e){e.preventDefault();};
    if( canvas_settings.border == 1 )
        canvas3.style.border = '1px solid '+canvas_settings.border_color;

const canvas4 = document.getElementById('weather-canvas');
    canvas4.width  = canvas_settings.width;
    canvas4.height = canvas_settings.height;
    canvas4.style.zIndex = '2';
    canvas4.onclick=function(e){e.preventDefault();};
    if( canvas_settings.border == 1 )
        canvas4.style.border = '1px solid '+canvas_settings.border_color;

const ctxMap    = canvas.getContext('2d');
const ctxEntity = canvas2.getContext('2d');
const ctxLayer 	= canvas3.getContext('2d');

/////////////////
//GAME SETTINGS//
/////////////////

//FPS
const FPS = 25;
const TILE_SIZE = { width:16, height:16 };
var MEMORY = {
    player:{},
    game:{
        entityAnimationData : {},
        entityImage : {},
        itemTypes : { //item type id : item type string name
            1 : 'helmet',
            2 : 'armor',
            3 : 'necklace',
            4 : 'first weapon',
            5 : 'second weapon',
            6 : 'skin face',
            7 : 'skin hair',
            8 : 'vanity head',
            9 : 'vanity armor',
            10: 'vanity body', //kanat vb.
            11: 'ring',
            images : { //item type id : icon location
                1 : 'assets/game/icons/items/helmet.png',
                2 : 'assets/game/icons/items/armor.png',
                3 : 'assets/game/icons/items/necklace.png',
                4 : 'assets/game/icons/items/weapon.png',
                5 : 'assets/game/icons/items/weapon.png',
                6 : '',
                7 : '',
                8 : 'assets/game/icons/items/helmet.png',
                9 : 'assets/game/icons/items/armor.png',
                10: '',
                11: 'assets/game/icons/items/ring.png'
            }
        },
        weather : {
            text : 'normal',
            class : null
        }
    }
};
var EVENTS = {
    player:{
        checkTime: FPS //MS
    },
    game:{
        checkTime: FPS //MS
    }
};
var PLAYER_COUNT = 0;

/* GAME SETTINGS */
MEMORY.game.settings = JSON.parse( localStorage.getItem('game_settings') );