function draw(entity_type, entity, is_list=0)
{
	switch (entity_type)
	{
		case 'player':
				drawEntity({type:'player',isList:is_list},entity);
		break;

		case 'mob':
			drawEntity({type:'mob',isList:is_list},entity);
		break;

		case 'npc':
			drawEntity({type:'npc',isList:is_list},entity);
		break;

		case 'map':
			drawMap(entity[0],entity[1],entity[2],entity[3],entity[4],entity[5],entity[6],entity[7]);
		break;
	}
}

//properties : object
function drawEntity(properties, entity){
	//do things according to entity type
	switch( properties.type )
	{
		case 'player':
			let LgxOW = ( properties.isList ) ? entity.length : 1;

			for( let i in entity )
			{
				entity = entity[i];

				let _new  = {
					face:{},
					hair:{},
					body:{},
					armor:{},
					helmet:{}
				}
				
				let face   = MEMORY.game.entityImage[entity.id].img.face;
				let hair   = MEMORY.game.entityImage[entity.id].img.hair;
				let body   = MEMORY.game.entityImage[entity.id].img.body;
				let armor  = MEMORY.game.entityImage[entity.id].img.armor;
				let helmet = MEMORY.game.entityImage[entity.id].img.helmet;

				if(entity.zoom_yon == 1)
				{
					//face
					_new.face.width  = face.width * entity.zoom_width;
					_new.face.height = face.height * entity.zoom_height;

					//hair
					if( typeof hair != undefined && hair != null )
					{
						_new.hair.width  = hair.width * entity.zoom_width;
						_new.hair.height = hair.height * entity.zoom_height;
					}

					//body
					_new.body.width  = body.width * entity.zoom_width;
					_new.body.height = body.height * entity.zoom_height;

					//armor
					if( typeof armor != 'undefined' && armor != null )
					{
						_new.armor.width  = armor.width * entity.zoom_width;
						_new.armor.height = armor.height * entity.zoom_height;
					}

					//helmet
					if( typeof helmet != 'undefined' && helmet != null )
					{
						_new.helmet.width  = helmet.width * entity.zoom_width;
						_new.helmet.height = helmet.height * entity.zoom_height;
					}
				}
				else if(entity.zoom_yon == 2)
				{
					//face
					_new.face.width  = face.width / entity.zoom_width;
					_new.face.height = face.height / entity.zoom_height;

					//hair
					if( typeof hair != "undefined" && hair != null )
					{
						_new.hair.width  = hair.width / entity.zoom_width;
						_new.hair.height = hair.height / entity.zoom_height;
					}

					//body
					_new.body.width  = body.width / entity.zoom_width;
					_new.body.height = body.height / entity.zoom_height;

					//armor
					if( typeof armor != "undefined" && armor != null )
					{
						_new.armor.width  = armor.width / entity.zoom_width;
						_new.armor.height = armor.height / entity.zoom_height;
					}

					//helmet
					if( typeof helmet != "undefined" && helmet != null )
					{
						_new.helmet.width  = helmet.width / entity.zoom_width;
						_new.helmet.height = helmet.height / entity.zoom_height;
					}
				}
				
				let _qafds = getEntityDrawingPoints(entity.x, entity.y, entity.img_width, entity.img_height);
				let drawing_x = _qafds[0]; //x
				let drawing_y = _qafds[1] - 15; //y

				if( MEMORY.game.entityImage[entity.id].isLoaded.face && MEMORY.game.entityImage[entity.id].isLoaded.hair && MEMORY.game.entityImage[entity.id].isLoaded.body && MEMORY.game.entityImage[entity.id].isLoaded.armor && MEMORY.game.entityImage[entity.id].isLoaded.helmet )
				{
					//
					// Player Animation
					//
					let frameWidth  = body.width/entity.frameWidth;
					let frameHeight = body.height/entity.frameHeight;

					let frameCount = ( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].frameCount : MEMORY.player.frameCount;
					let widthMod   = ( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].widthMod   : MEMORY.player.widthMod;

					if( entity.pressingUp || entity.pressingDown || entity.pressingLeft || entity.pressingRight )
					{
						
						if( frameCount % 12 == 0 )
						{
							( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].widthMod++ : MEMORY.player.widthMod++;

							if( widthMod + 1 >= entity.frameWidth )
								( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].widthMod = 0 : MEMORY.player.widthMod = 0;
						}
						( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].frameCount++ : MEMORY.player.frameCount++;
					}
					else
					{
						( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].widthMod = 1   : MEMORY.player.widthMod = 1;
						( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].frameCount = 0 : MEMORY.player.frameCount = 0;
					}

					let drawModWidth  = ( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].widthMod : MEMORY.player.widthMod;
					let drawModHeight = ( properties.isList ) ? MEMORY.game.entityAnimationData[entity.id].heightMod : MEMORY.player.heightMod;
					
					//body
					ctxEntity.drawImage(
						body,
						drawModWidth*frameWidth,drawModHeight*frameHeight,
						frameWidth,
						frameHeight,
						drawing_x,drawing_y,
						_new.body.width,
						_new.body.height
					);

					//face
					ctxEntity.drawImage(
						face,
						drawModWidth*frameWidth,drawModHeight*frameHeight,
						frameWidth,
						frameHeight,
						drawing_x,drawing_y,
						_new.face.width,
						_new.face.height
					);

					//hair
					if( typeof hair != 'undefined' && hair != null && (typeof helmet == 'undefined' || helmet == null) )
					{
						ctxEntity.drawImage(
							hair,
							drawModWidth*frameWidth,drawModHeight*frameHeight,
							frameWidth,
							frameHeight,
							drawing_x,drawing_y-9,
							_new.hair.width,
							_new.hair.height
						);
					}

					//armor
					if( typeof armor != 'undefined' && armor != null )
					{
						ctxEntity.drawImage(
							armor,
							drawModWidth*frameWidth,drawModHeight*frameHeight,
							frameWidth,
							frameHeight,
							drawing_x,drawing_y+39,
							_new.armor.width,
							_new.armor.height
						);
					}

					//helmet
					if( typeof helmet != 'undefined' && helmet != null )
					{
						ctxEntity.drawImage(
							helmet,
							drawModWidth*frameWidth,drawModHeight*frameHeight,
							frameWidth,
							frameHeight,
							drawing_x,drawing_y-5,
							_new.helmet.width,
							_new.helmet.height
						);
					}
				}
				else
				{
					ctxEntity.font = '20px Munro';
					ctxEntity.fillStyle = 'white';
					ctxEntity.fillText('Loading Character Image..',drawing_x,drawing_y+60);
				}

				/* DRAWING NAME */
				if( MEMORY.game.settings.show_names )
				{
					let incX = 15,
						incY = -15;

					if( entity.name.length < 4 )
						incX = 33;
					else if( entity.name.length > 8 )
						incX = 0;

					ctxEntity.fillStyle = MEMORY.game.settings.player_name_color;
					ctxEntity.font = '20px Munro';
					ctxEntity.fillText(entity.name,drawing_x+incX,drawing_y+incY);

					/* BUMPER DOTS */
					// ctxEntity.fillStyle='blue';
					// ctxEntity.fillRect(drawing_x + _new.width/2-5,drawing_y + _new.height/2+5,10,10);
					// ctxEntity.fill();

					// ctxEntity.fillStyle='red';
					// ctxEntity.fillRect(drawing_x+25,drawing_y+20,10,10);
					// ctxEntity.fill();

					// ctxEntity.fillStyle='red';
					// ctxEntity.fillRect(drawing_x+_new.width-35,drawing_y+20,10,10);
					// ctxEntity.fill();

					// ctxEntity.fillStyle='red';
					// ctxEntity.fillRect(drawing_x+25,drawing_y + _new.height-5,10,10);
					// ctxEntity.fill();

					// ctxEntity.fillStyle='red';
					// ctxEntity.fillRect(drawing_x+_new.width-35,drawing_y + _new.height-5,10,10);
					// ctxEntity.fill();
				}
			}

		break;

		case 'npc':

		break;

		case 'mob':

		break;
	}
}

function drawMap(assetPath,map_zoom_w,map_zoom_h,inc_dec,x,y,entityPath){
	clearCanvas('map');
	clearCanvas('layer');

	let img = assetPath;

	let _new = {};


	if(inc_dec === 1)
	{
		_new.width  = img.width * map_zoom_w;
		_new.height = img.height * map_zoom_h;
	}
	else if(inc_dec === 2)
	{
		_new.width  = img.width / map_zoom_w;
		_new.height = img.height / map_zoom_h;
	}
	ctxMap.drawImage(
			img,
			0,0,
			img.width,
			img.height,
			x,y,
			_new.width,
			_new.height
	);

	//collision/layer background
	let img2 = entityPath;

	let _new2 = {};

	if(inc_dec === 1)
	{
		_new2.width2  = img2.width * map_zoom_w;
		_new2.height2 = img2.height * map_zoom_h;
	}
	else if(inc_dec === 2)
	{
		_new2.width2  = img2.width / map_zoom_w;
		_new2.height2 = img2.height / map_zoom_h;
	}
	ctxLayer.drawImage(
			img2,
			0,0,
			img2.width,
			img2.height,
			x,y,
			_new2.width2,
			_new2.height2
	);
}

function clearCanvas(which){
	switch (which)
	{
		case 'entity':
			ctxEntity.clearRect(0,0,canvas_settings.width,canvas_settings.height);
		break;

		case 'map':
			ctxMap.clearRect(0,0,canvas_settings.width,canvas_settings.height);
		break;

		case 'layer':
			ctxLayer.clearRect(0,0,canvas_settings.width,canvas_settings.height);
		break;
	}
}

function isEntityMoving( entity ){
	if( !entity.pressingUp && !entity.pressingDown && !entity.pressingLeft && !entity.pressingRight )
		return false;
	else
		return true;
}

function getEntityDrawingPoints( x,y, width, height ){
	x -= CURRENT_PLAYER.x;
	y -= CURRENT_PLAYER.y;

	x += canvas_settings.width/2;
	y += canvas_settings.height/2;

	x -= width/2;
	y -= height/2;

	return [ x,y ];
}

function getPercentBetween(val1, val2){
	let x = ((val1 - val2) / val1)*100;

	return x;
}

function openWindow( obj ){
	if(!obj.width)
		obj.width = 650;
	if(!obj.height)
		obj.height = 400;
	if(!obj.title)
		obj.title = "";
	if(!obj.open_time)
		obj.open_time = 300;
	if(!obj.top)
		obj.top = 50;
	if(!obj.content)
		obj.content = "no_content.html";

	$(function(){
		$("div#game-windows > #window > #head > #title").html(obj.title);
		$("div#game-windows > #window").css({
			width:obj.width,
			height:obj.height,
			marginTop:obj.top
		});
		$("div#game-windows > #window > #content").css({
			width     : obj.width-1,
			height    : obj.height-35,
			maxWidth  : obj.width-1,
			maxHeight : obj.height-35,
			wordWrap  : 'break-word'
		});
		$("div#game-windows > #window > #content > #loader").show();
		$("div#game-windows > #window > #content > #data").hide();
		$("div#game-windows > #window > #head > ul > li#close-button").on('click',function(){
			AUDIO_LIST['window_closeAudio'].play();
		});
		$("div#game-windows").stop().fadeIn(obj.open_time);
		$.ajax({
			url:"assets/game/ui/"+obj.content,
			type:"get",
			success:function(data){
				$("div#game-windows > #window > #content > #loader").stop().fadeOut(300);
				setTimeout(function(){
					$("div#game-windows > #window > #content > #data").stop().html(data).fadeIn(300);

                    $("div#game-windows > #window > #content > #data > #game-tab-settings > #content-area").css({
                        width     : obj.width-1,
                        height    : obj.height-35,
                        maxWidth  : obj.width-1,
                        maxHeight : obj.height-35,
                        wordWrap  : 'break-word',
                        overflow  : 'auto'
                    });
				}, 300);
			}
		});
	});
}

function addChatMsg(obj={from:"ERROR",msg:"ERROR"})
{
	if(!obj.color)
		obj.color = "orange";

	let game_chat = document.querySelector('div#game-chat > div#chat');

	let div = document.createElement("div");
	div.id  = "msg";

	let ul  = document.createElement("ul");
	ul.id   = "chat-ul";

	div.appendChild(ul);

	let writer = document.createElement('li');
	writer.innerHTML   = obj.from+":";
	writer.style.color = obj.color;

	let msg    = document.createElement('li');
	let span   = document.createElement('span');
	msg.appendChild(span);
	span.innerHTML = obj.msg;

	ul.appendChild(writer);
	ul.appendChild(msg);

	game_chat.appendChild(div);

	game_chat.scrollTop = 1241241251251251*1241241251251251;
}

function addAlertMsg(obj={msg:null,duration:3,size:20, color:'cyan', wait:0})
{

	let defaultDuration = 3, //second
		defaultSize     = 17, //px
		defaultColor    = 'cyan', //hex or color's name or RGBA
		defaultWaitTime = 0; //second

	if(!obj.msg)
		return false;
	if(!obj.duration)
		obj.duration = defaultDuration;
	if(obj.duration <= 0)
		obj.duration = defaultDuration;
	if(!obj.size)
		obj.size  = defaultSize;
	if(obj.size < 16)
		obj.size  = defaultSize;
	if(!obj.color)
		obj.color = defaultColor;
	if(!obj.wait)
		obj.wait  = 0;
	if(obj.wait < 0)
		obj.wait  = 0;

	setTimeout(function(){
		let msg_div = document.getElementById('alert-msg');

		let div = document.createElement('div');
		div.id  = 'msg';
		div.innerHTML = obj.msg;
		div.style.color    = obj.color;
		div.style.fontSize = obj.size+"px";

		msg_div.insertBefore(div, msg_div.firstChild);

		setTimeout(function(){

			div.style.display = 'none';
			div.parentNode.removeChild(div);

		}, obj.duration*1000);
	}, obj.wait*1000);
}

function setHP( new_value )
{
    $(".indicator-bar > .bar-hp").css({"width":( 100 - getPercentBetween(CURRENT_PLAYER.hp, CURRENT_PLAYER.current_hp) )+"%"});
    $("span#current-hp").html(CURRENT_PLAYER.current_hp);
    $("span#max-hp").html(CURRENT_PLAYER.hp);
}
function setMP( new_value )
{
	$(".indicator-bar > .bar-mp").css({"width":( 100 - getPercentBetween(CURRENT_PLAYER.mp, CURRENT_PLAYER.current_mp) )+"%"});
    $("span#current-mp").html(CURRENT_PLAYER.current_mp);
    $("span#max-mp").html(CURRENT_PLAYER.mp);
}
function setEXP( new_value )
{
	setTimeout(()=>{ 
		$(".indicator-bar > .bar-exp").css({"width":( 100 - getPercentBetween(CURRENT_PLAYER.exp, CURRENT_PLAYER.current_exp) )+"%"});
		$("span#current-exp").html(CURRENT_PLAYER.current_exp);
		$("span#max-exp").html(CURRENT_PLAYER.exp);
	 }, 150);
}
function setGold( new_value ){
	$('#player-gold-amount').html( new_value );
}

function setDiamond( new_value ){
	$('#player-diamond-amount').html( new_value );
}

function playAudio( obj ){
	// Example:
	// {name:'window_closeAudio',path:'assets/game/sounds/window_close.mp3',loop:false,volume:0.1,autoPlay:false}
	if( !obj.volume ) obj.volume = 1.0;
	if( !obj.name )   obj.name   = Math.random();

	let audio = new Audio();
	audio.src = obj.path;

	if( obj.loop )       audio.loop   = true;
	if( obj.volume )     audio.volume = obj.volume;
	if( obj.autoPlay )   audio.play();

	AUDIO_LIST[obj.name] = audio;

	return;
}
function refreshInventory(){
	$(function(){
		if( document.getElementById('player-inventory') != null )
		{
			//clear bag slots
			$('#player-inventory > #section-2').html('');

			//draw player's bag slots
			for( let i=0; i < CURRENT_PLAYER.inventory_limit; i++ )
				$('#player-inventory > #section-2').append('<div id="kare"></div>');
			
			//put inventory items to bag slots
			let rEzWE = 0; //last index of bag slots
			for( let i in CURRENT_PLAYER.inventory )
			{
				if( i != 'inArray' && typeof CURRENT_PLAYER.inventory[i] != 'undefined' && CURRENT_PLAYER.inventory[i] != null )
				{
					let item      = CURRENT_PLAYER.inventory[i];
					let item_id   = i;
					let item_type = MEMORY.game.itemTypes[item.type];
					let slot      = document.querySelectorAll('#player-inventory > #section-2 > #kare');

					slot[rEzWE].innerHTML = '<img src="'+MEMORY.game.itemTypes.images[item.type]+'" id="item-icon"><div id="item-desc"><span id="item-desc"><span class="'+item.rarity+'" id="item-name">'+item.name+'</span>'+item.description+'<span id="rarity">Rarity: '+item.rarity+'</span><button class="inventory-btn" id="equip" onclick="equipItem({\'user_id\':'+CURRENT_PLAYER.user_id+',\'player_name\':\''+CURRENT_PLAYER.name+'\',\'item_id\':'+item_id+',\'item_type\':\''+item_type+'\',\'item_info\':{\'name\':\''+item.name.split("'").join("\\'")+'\',\'description\':\''+item.description.split("'").join("\\'")+'\',\'rarity\':\''+item.rarity+'\'},\'item_img\':\''+item.img+'\'})">Equip</button></span></div>';

					rEzWE++;
				}
			}
			
			let dom;
			
			//weapon
			if( CURRENT_PLAYER.inventory_equipped.item_infos.weapon == null || typeof CURRENT_PLAYER.inventory_equipped.item_infos.weapon == 'undefined' )
				dom = '<div id="wrap"><span>No weapon</span></div>';
			else
				dom = '<div id="wrap"><span class="'+CURRENT_PLAYER.inventory_equipped.item_infos.weapon.rarity+'"><img src="assets/game/icons/items/weapon.png" id="item-icon">'+CURRENT_PLAYER.inventory_equipped.item_infos.weapon.name+'</span></div><div id="desc"><span id="item-desc">'+CURRENT_PLAYER.inventory_equipped.item_infos.weapon.description+'<br/><span id="rarity">Rarity: '+CURRENT_PLAYER.inventory_equipped.item_infos.weapon.rarity+'</span><br/><br/><button class="inventory-btn" id="unequip" target="weapon" onclick="unequipItem(this)">Unequip</button></span></div>';        
			$('#player-inventory > div#section-1 > div > div > div#item-section[target="weapon"] + div#item').html(dom);
			
			//helmet
			if( CURRENT_PLAYER.inventory_equipped.item_infos.helmet == null || typeof CURRENT_PLAYER.inventory_equipped.item_infos.helmet == 'undefined' )
				dom = '<div id="wrap"><span>No helmet/hat</span></div>';
			else
				dom = '<div id="wrap"><span class="'+CURRENT_PLAYER.inventory_equipped.item_infos.helmet.rarity+'"><img src="assets/game/icons/items/helmet.png" id="item-icon">'+CURRENT_PLAYER.inventory_equipped.item_infos.helmet.name+'</span></div><div id="desc"><span id="item-desc">'+CURRENT_PLAYER.inventory_equipped.item_infos.helmet.description+'<br/><span id="rarity">Rarity: '+CURRENT_PLAYER.inventory_equipped.item_infos.helmet.rarity+'</span><br/><br/><button class="inventory-btn" id="unequip" target="helmet" onclick="unequipItem(this)">Unequip</button></span></div>';
			$('#player-inventory > div#section-1 > div > div > div#item-section[target="helmet"] + div#item').html(dom);
			
			//armor
			if( CURRENT_PLAYER.inventory_equipped.item_infos.armor == null || typeof CURRENT_PLAYER.inventory_equipped.item_infos.armor == 'undefined' )
				dom = '<div id="wrap"><span>No armor/robe</span></div>';
			else
				dom = '<div id="wrap"><span class="'+CURRENT_PLAYER.inventory_equipped.item_infos.armor.rarity+'"><img src="assets/game/icons/items/armor.png" id="item-icon">'+CURRENT_PLAYER.inventory_equipped.item_infos.armor.name+'</span></div><div id="desc"><span id="item-desc">'+CURRENT_PLAYER.inventory_equipped.item_infos.armor.description+'<br/><span id="rarity">Rarity: '+CURRENT_PLAYER.inventory_equipped.item_infos.armor.rarity+'</span><br/><br/><button class="inventory-btn" id="unequip" target="armor" onclick="unequipItem(this)">Unequip</button></span></div>';        
			$('#player-inventory > div#section-1 > div > div > div#item-section[target="armor"] + div#item').html(dom);
			
			//necklace
			if( CURRENT_PLAYER.inventory_equipped.item_infos.necklace == null || typeof CURRENT_PLAYER.inventory_equipped.item_infos.necklace == 'undefined' )
				dom = '<div id="wrap"><span>No necklace</span></div>';
			else
				dom = '<div id="wrap"><span class="'+CURRENT_PLAYER.inventory_equipped.item_infos.necklace.rarity+'"><img src="assets/game/icons/items/necklace.png" id="item-icon">'+CURRENT_PLAYER.inventory_equipped.item_infos.necklace.name+'</span></div><div id="desc"><span id="item-desc">'+CURRENT_PLAYER.inventory_equipped.item_infos.necklace.description+'<br/><span id="rarity">Rarity: '+CURRENT_PLAYER.inventory_equipped.item_infos.necklace.rarity+'</span><br/><br/><button class="inventory-btn" id="unequip" target="necklace" onclick="unequipItem(this)">Unequip</button></span></div>';        
			$('#player-inventory > div#section-1 > div > div > div#item-section[target="necklace"] + div#item').html(dom);
			
			//ring
			if( CURRENT_PLAYER.inventory_equipped.item_infos.ring == null || typeof CURRENT_PLAYER.inventory_equipped.item_infos.ring == 'undefined' )
				dom = '<div id="wrap"><span>No ring</span></div>';
			else
				dom = '<div id="wrap"><span class="'+CURRENT_PLAYER.inventory_equipped.item_infos.ring.rarity+'"><img src="assets/game/icons/items/ring.png" id="item-icon">'+CURRENT_PLAYER.inventory_equipped.item_infos.ring.name+'</span></div><div id="desc"><span id="item-desc">'+CURRENT_PLAYER.inventory_equipped.item_infos.ring.description+'<br/><span id="rarity">Rarity: '+CURRENT_PLAYER.inventory_equipped.item_infos.ring.rarity+'</span><br/><br/><button class="inventory-btn" id="unequip" target="ring" onclick="unequipItem(this)">Unequip</button></span></div>';        
			$('#player-inventory > div#section-1 > div > div > div#item-section[target="ring"] + div#item').html(dom);
		}
	});
}
String.prototype.replaceArray = function(find=[], replace=[]){
	let string = this;

	for( let i=0; i < find.length; i++ )
	{
		string = string.split( find[i] ).join( replace[i] );
	}
	return string;
}

function objectToArray(obj){
	if(typeof obj != 'object' && obj == null)
		return false;
	
	let _return = [];

	for( let i in obj )
	{
		obj[i].___key = i;
		_return.push(obj[i]);
	}
	
	return _return;
}

/**
 * GAME WEATHER
 */
function setWeather( type ){ //default weather is 'normal', MEMORY.game.weather
	switch( type )
	{
		case 'rainy':
			MEMORY.game.weather.class = new EB_RAIN(canvas4,{
				fps : 60,
				autoClear : true,
				autoRun : true,
				color: 'cyan'
			});
			MEMORY.game.weather.text = type;
		break;

		default:
			if( typeof MEMORY.game.weather.class != 'undefined' && MEMORY.game.weather.class != null )
				MEMORY.game.weather.class.stop();
			
			MEMORY.game.weather.class = null;
			MEMORY.game.weather.text  = 'normal';
		break;
	}
}

/********************* DEBUG **************************/

//gets player list
function getPlayerList(){
	socket.emit("GM-PlayerList",{});

	return '|~~PLAYER LIST~~|';
}

function getMapDataList(){
	socket.emit('GM-MapDataList',{});

	return '|~~MAP DATA LIST~~|';
}

//deals dmg to yourself
function dealDmg(dmg, type=1){
	let id   = CURRENT_PLAYER.id;
	let stat = ( type == 1 ) ? 'HP' : 'MP';
	socket.emit("GM-DealDmg",{player_id : id, dmg : dmg, type : type});

	return 'Dealing '+dmg+' damage to '+stat+'.';
}

socket.on("GM-PlayerListResponse",function(data){
	console.log(data);
});

socket.on('GM-MapDataListResponse',function(data){
	console.log(data);
});

/*****************************************************/