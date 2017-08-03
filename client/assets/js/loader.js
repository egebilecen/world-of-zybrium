var __RESOURCE_INIT__    = 0;
var __RESOURCE_COUNT__   = 4;
var __RESOURCE_COUNTER__ = 0;
var AUDIO_LIST = {};

socket.emit('getMapInfo',{map_id:CURRENT_PLAYER.current_map_id});

ctxMap.fillStyle = 'red';
ctxMap.font = '25px Munro';
ctxMap.fillText('Loading resources...',canvas.width/2 - 100,canvas.height/2 - 50);

socket.on('responseGetMapInfo',function(data){
  CURRENT_MAP = data;

  SERVER_TIME = {
    hour:data.server_time.hour,
    minute:data.server_time.minute,
    second:data.server_time.second
  }

  //--[ Load Map (Map IMG)
  CURRENT_MAP.IMG     = new Image();
  CURRENT_MAP.IMG.src = CURRENT_MAP.img;

  CURRENT_MAP.IMG.onload = function () {
    __RESOURCE_COUNTER__++;
  }

  CURRENT_MAP.IMG.onerror = function () {
    console.warn('Map couldn\'t loaded.');
  }

  //--[ Load Map's Entities (Collision IMG)
  CURRENT_MAP.IMG2     = new Image();
  CURRENT_MAP.IMG2.src = CURRENT_MAP.entities;

  CURRENT_MAP.IMG2.onload = function () {
    __RESOURCE_COUNTER__++;
  }

  CURRENT_MAP.IMG2.onerror = function () {
    console.warn('Map\'s Collision couldn\'t loaded.');
  }

  //--[ Load Audio Files
  playAudio({name:'window_closeAudio',path:'assets/game/sounds/window_close.mp3',loop:false,volume:0.1,autoPlay:false});

  //--[ Load Map's Collision
  $.ajax({
    url:'assets/game/map/data_list/'+CURRENT_MAP.id+'.json',
    datatype:'json',
    type:'get',
    success:function(data){
      data.zoomed = CURRENT_MAP.zoomed;
      socket.emit('playerMapDataList',{dataList:data});

      // CURRENT_MAP.dataList = data;
      // delete CURRENT_MAP.dataList.map_id;

      //--[ Delete Useless Things
      delete CURRENT_MAP.img;
      delete CURRENT_MAP.entities;
      delete CURRENT_MAP.server_time;

      __RESOURCE_COUNTER__++;
    }
  });

  socket.on('responsePlayerMapDataList',function(data){
    if( data.code == 1 ) __RESOURCE_COUNTER__++;
  });
});

//--[ Resource Checker
var resourceChecker = setInterval(function(){
    if(__RESOURCE_COUNTER__ >= __RESOURCE_COUNT__)
    {
      __RESOURCE_INIT__ = 1;
      clearInterval(resourceChecker);
    }
},1000/FPS);

function int(val, float=true){
  if( float == true )
    return parseFloat(val);
  else if( float == false )
    return parseInt(val);
}