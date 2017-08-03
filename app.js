//SETTING DATABASE//
const mongojs = require('mongojs');
const TABLES  = ['account','classes','game_settings','game_taken_names','items','maps','mobs','npcs','reports']; //collections
const db 	  =  mongojs('localhost:27017/woz', TABLES);

/////////////////////
const express = require('express');
const app  = express();
const serv = require('http').Server(app);
const path = require('path');

//CONSTS//
const date = new Date();
const CURRENT_DATE = {
	day    : date.getDate(),
	month  : date.getMonth()+1,
	year   : date.getFullYear(),
	hour   : date.getHours(),
	minute : date.getMinutes(),
	second : date.getSeconds()
};
const SERVER_PORT = 6969;
const MS = 25;
const TILE_SIZE = { width:16, height:16 };
const ADMIN_PASSWORDS = [
	'NDkxNjI1Z2VjaWNpIw==',
	'test'
];

//GAME FILES ETC.//
const players  = require('./server/players');
const string   = require('./server/string');
/////////////////////

app.get('/', function(req, res){
	res.sendFile(__dirname+'/client/index.html');
});
app.get('/game', function(req, res){
	res.sendFile(__dirname+'/client/game.html');
});
app.get('/debug', function(req, res){
	res.sendFile(__dirname+'/client/debug.html');
});

app.get('/game_settings', function(req, res){
	res.sendFile(__dirname+'/client/game_editor.html');
});

app.use(express.static(path.join(__dirname, 'client')));

serv.listen(SERVER_PORT);

//SOCKET VARIABLES//
var SOCKET_LIST   = {}
var PLAYER_LIST   = players.list;
var MAP_DATA_LIST = {}

//OTHER VARIABLES//
const print = {
	info : function(text){
		console.log('[?] '+text);
	},
	error : function(text){
		console.log('[!] '+text);
	}
}

console.log('======================================' +
		'\n========== WORLD OF ZYBRIUM ==========' +
		'\n======================================');

/*******
 * Set info variables
 */
var MAP_INFO   = {}
var ITEM_INFO  = {} 
var NPC_INFO   = {}
var MOB_INFO   = {}
var CLASS_INFO = {}
var GAME_SETTINGS = {} //game settings from DB
var STARTING_ITEM_INFO = {}

db.npcs.find({},function(err,res){
	if( err )
		throw new Error('Cannot get NPCs from DB!');
	else
	{
		for( let i=0; i < res.length; i++ )
		{
			let npc = res[i];

			NPC_INFO[npc.id] = npc;
		}
	}
});

db.mobs.find({},function(err,res){
	if( err )
		throw new Error('Cannot get MOBs from DB!');
	else
	{
		for( let i=0; i < res.length; i++ )
		{
			let mob = res[i];

			MOB_INFO[mob.id] = mob;
		}
	}
});

db.maps.find({},function(err,res){ //maps info
	if( err )
		throw new Error('Cannot get Maps from DB!');
	else
	{
		for( let i=0; i < res.length; i++ )
		{
			let map = res[i];

			//mobs
			try
			{
				for( let j=0; j < map.mobs.length; j++ )
				{
					let mob   = MOB_INFO[map.mobs[j]];
					delete mob._id;
					let index = map.mobs.indexOf(mob.id);
					
					map.mobs[index] = mob;
				}
			}
			catch(err)
			{
				throw new Error('An error occured while assigning mob informations to map.');
			}

			//npcs
			try
			{
				for( j=0; j < map.npcs.length; j++ )
				{
					let npc   = NPC_INFO[map.npcs[j]];
					delete npc._id;
					let index = map.npcs.indexOf(npc.id);
					
					map.npcs[index] = npc;
				}
			}
			catch(err)
			{
				throw new Error('An error occured while assigning npc informations to map.');
			}

			MAP_INFO[map.id] = map;
		}
	}
});

db.items.find({},function(err,res){ //items info
	if( err )
		throw new Error('Cannot get Items from DB!');
	else
	{
		for( let i=0; i < res.length; i++ )
		{
			let item = res[i];

			ITEM_INFO[item.id] = item;
		}
	}
});

db.items.find({"is_starting_item":1},function(err,res){
	if(err)
		throw new Error('Cannot get starting items from DB!');
	else
	{
		for( let i=0; i < res.length; i++ )
		{
			let item = res[i];
			
			if( item.is_starting_item == 1 )
				STARTING_ITEM_INFO[item.id] = item;
		}
	}
});

db.classes.find({},function(err,res){ //classes info
	if( err )
		throw new Error('Cannot get Classes from DB!');
	else
	{
		for( let i=0; i < res.length; i++ )
		{
			let _class = res[i];

			CLASS_INFO[_class.id] = _class;
		}
	}
});

db.game_settings.find({},function(err,res){ //classes info
	if( err )
		throw new Error('Cannot get Game Settings from DB!');
	else
	{
		let settings = res[0];
		delete settings._id;

		GAME_SETTINGS = settings;
	}
});

print.info('Info variables has been set.');

var io = require('socket.io')(serv,{});
io.sockets.on('connection',function(socket){
//
	
	//Initialize socket
	socket.id = Math.random();
	socket.logged_in_to_game = false;
	SOCKET_LIST[socket.id] = socket;

	//on login request
	socket.on('loginRequest', function(data){
		db.account.find({username:str(data.username),password:str(data.password)}, function(err, res){
			if(res.length > 0)
			{
				socket.emit('loginResponse',{
					code:1,
					msg:"Basariyla giris yaptiniz.",
					player_data:res[0].game_player_data,
					max_player:res[0].max_player,
					user_id:res[0].user_id
				});
				socket.user_db_id = res[0].user_id;
			}
			else
			{
				socket.emit('loginResponse',{
					code:0,
					msg:'Kullanici adi veya sifre yanlis.'
				});
			}
		});
	});

	//init character that already created
	socket.on('selectCharacter',function(data){
		if( socket.user_db_id == data.user_id )
		{
			let player_options = GAME_SETTINGS.player_img;

			db.account.find({"user_id":data.user_id},function(err , res){
				//Initialize player
				let game_player_data = res[0].game_player_data[data.index];
				
				if( game_player_data )
				{
					let counter = 0;
					let total_count = 8;
					let LOADED_SKIN_DATAS = {
						face:null,
						hair:null,
						body:null,
						armor:null,
						helmet:null
					}
					let temp_item_infos = { //equipped item's temporary infos
						face:null,
						hair:null,
						body:null,
						weapon:null,
						helmet:null,
						armor:null,
						necklace:null,
						ring:null
					}
					
					if( game_player_data.inventory_equipped.face != 0 )
					{
						//face
						LOADED_SKIN_DATAS.face = ITEM_INFO[game_player_data.inventory_equipped.face].img;
						temp_item_infos.face = {
							name : ITEM_INFO[game_player_data.inventory_equipped.face].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.face].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.face].rarity
						}
					}
					counter++;
					

					if( game_player_data.inventory_equipped.hair != 0 )
					{
						//hair
						LOADED_SKIN_DATAS.hair = ITEM_INFO[game_player_data.inventory_equipped.hair].img;
						temp_item_infos.hair = {
							name : ITEM_INFO[game_player_data.inventory_equipped.hair].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.hair].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.hair].rarity
						}
					}
					counter++;

					if( game_player_data.inventory_equipped.body != 0 )
					{
						//body
						LOADED_SKIN_DATAS.body = ITEM_INFO[game_player_data.inventory_equipped.body].img;
						temp_item_infos.body = {
							name : ITEM_INFO[game_player_data.inventory_equipped.body].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.body].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.body].rarity
						}
					}
					counter++;

					if( game_player_data.inventory_equipped.weapon != 0 )
					{
						//weapon
						temp_item_infos.weapon = {
							name : ITEM_INFO[game_player_data.inventory_equipped.weapon].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.weapon].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.weapon].rarity
						}
					}
					counter++;

					if( game_player_data.inventory_equipped.helmet != 0 )
					{
						//helmet
						LOADED_SKIN_DATAS.helmet = ITEM_INFO[game_player_data.inventory_equipped.helmet].img;
						temp_item_infos.helmet = {
							name : ITEM_INFO[game_player_data.inventory_equipped.helmet].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.helmet].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.helmet].rarity
						}
					}
					counter++;

					if( game_player_data.inventory_equipped.armor != 0 )
					{
						//armor
						LOADED_SKIN_DATAS.armor = ITEM_INFO[game_player_data.inventory_equipped.armor].img;
						temp_item_infos.armor = {
							name : ITEM_INFO[game_player_data.inventory_equipped.armor].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.armor].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.armor].rarity
						}
					}
					counter++;

					if( game_player_data.inventory_equipped.necklace != 0 )
					{
						//necklace
						temp_item_infos.necklace = {
							name : ITEM_INFO[game_player_data.inventory_equipped.necklace].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.necklace].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.necklace].rarity
						}
					}
					counter++;

					if( game_player_data.inventory_equipped.ring != 0 )
					{
						//ring
						temp_item_infos.ring = {
							name : ITEM_INFO[game_player_data.inventory_equipped.ring].name,
							description : ITEM_INFO[game_player_data.inventory_equipped.ring].description,
							rarity : ITEM_INFO[game_player_data.inventory_equipped.ring].rarity
						}
					}
					counter++;

					//item infos of inventory
					if( game_player_data.inventory.length > 0 ) //eşya var ise
					{
						//edit total count for start player initialize
						total_count += game_player_data.inventory.length;

						let item_infos_jsSBe = gamePlayerInventoryReturnData(game_player_data.inventory);

						counter += game_player_data.inventory.length;

						game_player_data.inventory = item_infos_jsSBe;
					}

					let interval = setInterval( () => {
						if( counter == total_count )
						{
							game_player_data.inventory_equipped['item_infos'] = temp_item_infos;
							
							let spawnX = ( MAP_INFO[game_player_data.current_map_id].allowSpawnWithPlayerCurrentCoords ) ? game_player_data.x : MAP_INFO[game_player_data.current_map_id].player_spawn_x;
							let spawnY = ( MAP_INFO[game_player_data.current_map_id].allowSpawnWithPlayerCurrentCoords ) ? game_player_data.y : MAP_INFO[game_player_data.current_map_id].player_spawn_y;

							let player = players.newPlayer(
								data.user_id, Math.random(), game_player_data.nickname,
								0, 0, //hp | mp
								0, //clas id
								LOADED_SKIN_DATAS,
								game_player_data.current_map_id,
								player_options, //asagida da duzelt
								spawnX, spawnY, game_player_data.maxSpd,
								game_player_data.gold, game_player_data.diamond,
								game_player_data.level, game_player_data.exp,
								game_player_data.inventory, game_player_data.inventory_limit, game_player_data.inventory_equipped
							);

							let class_data = CLASS_INFO[game_player_data.class_id];

							//Set player hp, mp
							let _class = {
								id:class_data.id,
								name:class_data.name,
								hp:class_data.base_health,
								mp:class_data.base_mana,
								weapon_type:class_data.weapon_type,
								armor_type:class_data.armor_type
							}

							//Set player hp, mp
							player.hp = _class.hp; //max hp
							player.mp = _class.mp; //max mp
							player.current_hp = _class.hp;
							player.current_mp = _class.mp;
							player.class_id   = _class.id;

							//set player MAX. EXP
							player.exp = 100;

							socket.player_id = player.id; //geçici id
							socket.logged_in_to_game = true;

							socket.emit('ResponseSelectCharacter',{code:1,status:true,player_data:player.returnData()});

							clearInterval(interval);
						}
					} ,1000/MS );
				}
			});
		}
	});

	//create character
	socket.on('createCharacter',function(data){
		if( data.nickname.length >= 3 && data.nickname.length <= 10 && ( typeof STARTING_ITEM_INFO[data.skins_id.face] != 'undefined' && typeof STARTING_ITEM_INFO[data.skins_id.hair] != 'undefined' && typeof STARTING_ITEM_INFO[data.skins_id.body] != 'undefined' ) )
		{
			let nickname = data.nickname;
			nickname = nickname.toLocaleLowerCase();
			db.game_taken_names.find({name:nickname},function(err,resx){
				if( !resx[0] ) //ad alınMAmış ise
				{
					if( typeof CLASS_INFO[data.class_id] != 'undefined' ) //class var mı kontrol et varsa, işlemi yap..
					{
						db.account.find({user_id: data.user_id}, function (err, res)
						{
							let player_data = res[0].game_player_data;

							if (player_data.length < res[0].max_player ) //eğer karakter sınırına ulaşmamış ise
							{
								let new_data = newPlayerInit( data.nickname,
																GAME_SETTINGS.playerInit.x,GAME_SETTINGS.playerInit.y,
																GAME_SETTINGS.playerInit.maxSpd,
																GAME_SETTINGS.playerInit.startingMapId,
																data.class_id,
																GAME_SETTINGS.playerInit.gold, GAME_SETTINGS.playerInit.diamond,
																GAME_SETTINGS.playerInit.level, GAME_SETTINGS.playerInit.exp,
																GAME_SETTINGS.playerInit.inventory,GAME_SETTINGS.playerInit.inventory_limit,
																{
																	"face":data.skins_id.face,
																	"hair":data.skins_id.hair,
																	"body":data.skins_id.body,
																	"armor":GAME_SETTINGS.playerInit.startingArmorId,
																	"weapon":0,
																	"helmet":0,
																	"necklace":0,
																	"ring":0
																});

								db.account.update({"user_id": data.user_id}, {$push: {"game_player_data": new_data}}, function (err, res) {
									if (err) //HATA VARSA
										socket.emit('ResponseCreateCharacter', {code: 0, msg: 'An error occured.'});
									else
									{
										db.game_taken_names.insert({name: nickname}, function (err, res)
										{
											if (!err)
											{
												socket.emit('ResponseCreateCharacter', {
													code: 1,
													msg: 'Character successfully created.'
												});			
											}
										});
									}
								});
							}
							else {
								socket.emit('ResponseCreateCharacter', {
									code: 0,
									msg: 'You have reached maximum character limit.'
								});
							}
						});
					}
				}
				else //ad alınmış ise
				{
					socket.emit('ResponseCreateCharacter',{code:0,msg:'Username is taken.'});
				}
			});
		}
	});

	//get skins
	socket.on('getSkinsSelectionScreen',function( data ){
		if( data.user_id == socket.user_db_id )
		{
			db.account.find({'user_id':data.user_id},function( err, res ){
				let skins_id = res[0].game_player_data[data.index].inventory_equipped;

				for( let i in skins_id )
				{
					let exclude = ['weapon','necklace','ring'];
					if( exclude.indexOf(i) != -1  ) continue;
					
					let skin_id = skins_id[i];
					if( skin_id == 0 ) skin_id = 1;

					let _skin = ITEM_INFO[skin_id];
					if( skin_id == 0 ) _skin.img = undefined;

					socket.emit(
						'responseGetSkinsSelectionScreen',
						{
							index:data.index,
							skin_data:{
								type:_skin.type,
								img:_skin.img
							}
						}
					);
				}
			});
		}
	});

	//send report
	socket.on('sendReport',function(data){
		if( socket.user_db_id != data.user_id )
		{
			socket.emit('responseSendReport',{code:0,msg:'An error occured. (Err:1)'});
		}
		else if( !data.section || !data.msg )
		{
			socket.emit('responseSendReport',{code:0,msg:'Please fill all inputs.'});
		}
		else if( data.msg.length < 10 || data.msg.length > 300 )
		{
			socket.emit('responseSendReport',{code:0,msg:'Message cannot be lower than 10 characters and cannot be greater than 300 characters.'});
		}
		else
		{
			db.reports.insert({"section":String(data.section),"message":String(data.msg),"sender_user_id":data.user_id,"status":1},function(err, res){
				if( err ) //hata varsa
					socket.emit('responseSendReport',{code:0,msg:'An error occured. (Err:2)'});
				else
					socket.emit('responseSendReport',{code:1,msg:'Report successfully sent!'});
			});
		}
	});

	//send map informations
	socket.on('getMapInfo', function(dataX){
		let map = MAP_INFO[dataX.map_id];
		let data = {
			id:map.id,
			name:map.name,
			img:map.img,
			entities:map.entities,
			mobs:map.mobs,
			npcs:map.npcs,
			zoom_width:map.zoom_width,
			zoom_height:map.zoom_height,
			zoom_yon:map.zoom_yon,
			zoomed:map.zoomed
		}
		data.server_time = CURRENT_DATE;

		socket.emit('responseGetMapInfo', data);
	});

	//--[ Player Map Data List
	socket.on('playerMapDataList',function(data){
		MAP_DATA_LIST[socket.player_id] = data.dataList;
		PLAYER_LIST[socket.player_id].sentDataList = true;
		socket.emit('responsePlayerMapDataList',{code:1});
	});

	socket.on('classesInfo',function(){
		db.classes.find({},function(err,res){
			if( !err ) socket.emit('reponseClassesInfo',res);
		});
	});

	/********************* DEBUG **************************/

	socket.on('GM-PlayerList',function(){
		socket.emit('GM-PlayerListResponse',PLAYER_LIST);
	});

	socket.on('GM-MapDataList',function(){
		socket.emit('GM-MapDataListResponse',MAP_DATA_LIST);
	});

	socket.on('GM-DealDmg',function(data){
		let player_id = data.player_id;
		let dmg  = data.dmg;
		let type = data.type;

		if( type == 1 )
			PLAYER_LIST[player_id].current_hp -= dmg;
		if( type == 2 )
			PLAYER_LIST[player_id].current_mp -= dmg;
	});

	socket.on('GAME-EDITOR-mapList',function(data){
		let true_pass = false;

		for( let i=0; i < ADMIN_PASSWORDS.length; i++ )
		{
			let PW = ADMIN_PASSWORDS[i];

			if( data.pass == PW )
			{
				true_pass = true;
				break;
			}
		}

		if( true_pass )
		{
			db.maps.find({},function(err, res){
				socket.emit('GAME-EDITOR-responseMapList',{data:res});
			});
		}
		else
		{
			socket.emit('GAME-EDITOR-ResponseWrongPassword',{});
		}
	});

	socket.on('GAME-EDITOR-playerInfo',function(data){
		let true_pass = false;

		for( let i=0; i < ADMIN_PASSWORDS.length; i++ )
		{
			let PW = ADMIN_PASSWORDS[i];

			if( data.pass == PW )
			{
				true_pass = true;
				break;
			}
		}

		if( true_pass )
		{
			if( data.player_name )
			{
				db.account.find({},function(err, res){
					if( res.length > 0 )
					{
						for( let i=0; i < res.length; i++ )
						{
							let _player = res[i].game_player_data;

							for( let j=0; j < _player.length; j++ )
							{
								let player = _player[j];

								if( player.nickname == data.player_name )
									socket.emit('GAME-EDITOR-responsePlayerInfo',{data:JSON.stringify(res[i])});
							}
						}
					}
				});
			}
		}
		else
		{
			socket.emit('GAME-EDITOR-ResponseWrongPassword',{});
		}
	});

	/********************* NON-GAME THINGS **************************/
	// Charater Creation Screen on website etc.						//
	/****************************************************************/
	socket.on('characterCreation-getSkinList',function(data){
		let counter = 0;
		let return_count = 3;
		let return_pack = {
			hair:null,
			face:null,
			body:null
		};

		db.items.find({"type":6,"is_starting_item":1},function(err,res){ //face
			return_pack.face = res;
			counter++;
		});
		db.items.find({"type":7,"is_starting_item":1},function(err,res){ //hair
			return_pack.hair = res;
			counter++;
		});
		db.items.find({"type":8,"is_starting_item":1},function(err,res){ //body
			return_pack.body = res;
			counter++;
		});

		let interval = setInterval( () => {
			if( counter == return_count )
			{
				socket.emit('characterCreation-responseGetSkinList',{data:return_pack});

				clearInterval(interval);
			}
		}, 1000/MS );
	});
	/****************************************************************/

	//When player press key
	socket.on('movementKeyPress', function(data){
		let player = PLAYER_LIST[data.id];

		if(data.inputId == 'left')
			player.pressingLeft = data.state;
		if(data.inputId == 'right')
			player.pressingRight = data.state;
		if(data.inputId == 'up')
			player.pressingUp = data.state;
		if(data.inputId == 'down')
			player.pressingDown = data.state;
	});

	//--[ Add Chat Message
	socket.on('addChatMsg',function(data){
		let map_id    = data.map_id;
		let player_id = data.id;
		let from      = PLAYER_LIST[player_id].name;
		let msg       = data.msg;
		let msg_type  = 1;  // 1-> normal msg, 2-> server command

		if( msg.charAt("0") == "/" )
			msg_type = 2;

		switch ( msg_type )
		{
			case 1: // normal msg

				if( msg.length < 5 )
					return false;
				else
				{
					for( let i in SOCKET_LIST )
					{
						let socket = SOCKET_LIST[i];

						if( socket.logged_in_to_game )
						{
							let socket_player = PLAYER_LIST[socket.player_id];

							if( socket_player.current_map_id == map_id )
								socket.emit("responseAddChatMsg",{from:from,msg:strip_tags(msg, ''),color:null});
						}
					}
				}

			break;

			/* SERVER COMMAND */
			case 2: // special char '/'
				let section = msg.split("/")[1];
					switch ( section )
					{
						case "help":
							let command_list = [
								{from:'INFO', msg:'<span class="dotted">/clear</span> - Clear the chat window.'}
							];

							for( let i=0; i < command_list.length; i++ )
							{
								let data = command_list[i];
								
								from = data.from;
								msg  = data.msg;

								socket.emit("responseAddChatMsg",{from:from,msg:msg,color:"#00ed00"});
							}
						break;

						default:
							from = "SYSTEM";
							msg  = "Command not found.";

							socket.emit("responseAddChatMsg",{from:from,msg:msg,color:"#00ed00"});
						break;
					}

			break;
		}
	});

	/**
	 * INVENTORY
	 */
	socket.on('playerEquipItem',function(data){
		let user_id 	= data.user_id;
		let player_name = data.player_name;
		let item_id   = data.item_id;
		let item_type = data.item_type;
		let item_info = data.item_info;
		let item_img  = data.item_img;

		if( socket.user_db_id == user_id && socket.logged_in_to_game )
		{
			db.account.find({"user_id":user_id},function( err, res ){
				if( !err )
				{
					let data = res[0];
					let player_data = null;
					let index = null;

					for( let i=0; i < data.game_player_data.length; i++ )
					{
						let IhNCe = data.game_player_data[i];
						if( IhNCe.nickname == player_name )
						{
							player_data = IhNCe;
							index = i;
							break;
						}
					}
					let XuIko = false;

					//find item from inventory
					if( player_data.inventory.indexOf(item_id) != -1 )
					{
						//control the items if already an item equipped
						//in same type
						if( player_data.inventory_equipped[item_type] != 0 )
						{
							if( player_data.inventory.length < player_data.inventory_limit )
							{
								//remove current equipped item
								//put it to inventory
								player_data.inventory.push(player_data.inventory_equipped[item_type]);
								player_data.inventory_equipped[item_type] = 0;
								
								XuIko = true;
							}
							else
								socket.emit('responsePlayerEquipItem',{'code':2,'msg':'canta dolu'});
						}
						else XuIko = true;

						if( XuIko == true )
						{
							//remove the item that
							//will be equipped from inventory
							player_data.inventory.splice(player_data.inventory.indexOf(item_id),1);
							player_data.inventory_equipped[item_type] = item_id;
						}

						let jTfTo = 'game_player_data.'+index+'.inventory_equipped';
						let rOwMj = 'game_player_data.'+index+'.inventory';

						db.account.update({'user_id':user_id},{$set:{[jTfTo]:player_data.inventory_equipped,[rOwMj]:player_data.inventory}},function(err2,res2){
							if( !err2 )
							{
								let socket_player = PLAYER_LIST[socket.player_id];

								socket_player.inventory_equipped[item_type] = item_id;
								socket_player.inventory_equipped.item_infos[item_type] = item_info;
								socket_player.inventory = gamePlayerInventoryReturnData(player_data.inventory);

								let items_that_have_img = ['face','hair','body','armor','helmet'];
								if( items_that_have_img.indexOf(item_type) != -1 )
								{
									for( let i in SOCKET_LIST )
									{
										let VxLKO = SOCKET_LIST[i];

										VxLKO.emit('responsePlayerEquipItem',{'code':1,'img':true,'img_link':item_img,'item':item_type,'playerID':socket.player_id});
									}
								}
								else
								{
									socket.emit('responsePlayerEquipItem',{'code':1,'img':false,'img_link':'','item':item_type,'playerID':socket.player_id});
								}
							}
						});
					}
					else //if cant find
					{
						socket.emit('responsePlayerEquipItem',{"code":0,"msg":"Item not found. (Code: 3)"});
					}
				}
				else
				{
					socket.emit('responsePlayerEquipItem',{"code":0,"msg":"Unknown error. (Code: 2)"});
				}
			});
		} 
	});

	 socket.on('playerUnequipItem',function(data){
		let user_id     = data.user_id;
		let player_name = data.player_name;
		let item = data.item;

		if( socket.user_db_id == user_id && socket.logged_in_to_game )
		{
			db.account.find({"user_id":user_id},function(err,res){
				if( !err )
				{
					let data        = res[0];
					let player_data = null;
					let index = null;

					//find true player
					for( let i=0; i < data.game_player_data.length; i++ )
					{
						let SDlmo = data.game_player_data[i];
						if( SDlmo.nickname == player_name )
						{
							player_data = SDlmo;
							index = i;
							break;
						}
					}

					//çantası boş mu dolu mu kontrol et.
					if( player_data.inventory.length < player_data.inventory_limit )
					{ //çanta boş ise
						let item_id = player_data.inventory_equipped[item];

						// if( typeof player_data.inventory_equipped[item] != 'undefined' )
						player_data.inventory_equipped[item] = 0;
						player_data.inventory.push(item_id);

						let AoYyN = 'game_player_data.'+index+'.inventory_equipped';
						let CrpcO = 'game_player_data.'+index+'.inventory';
						
						db.account.update({'user_id':user_id},{$set:{[AoYyN]:player_data.inventory_equipped,[CrpcO]:player_data.inventory}},function(err2,res2){
							if( !err2 )
							{
								let socket_player = PLAYER_LIST[socket.player_id];

								socket_player.inventory_equipped[item] = 0;
								socket_player.inventory_equipped.item_infos[item] = null;
								socket_player.inventory = gamePlayerInventoryReturnData(player_data.inventory);

								let items_that_have_img = ['face','hair','body','armor','helmet'];
								if( items_that_have_img.indexOf(item) != -1 )
								{
									for( let i in SOCKET_LIST )
									{
										let VxLKO = SOCKET_LIST[i];

										VxLKO.emit('responsePlayerUnequipItem',{'code':1,'img':true,'item':item,'playerID':socket.player_id});
									}
								}
								else
								{
									socket.emit('responsePlayerUnequipItem',{'code':1,'img':false,'item':item,'playerID':socket.player_id});
								}
							}
						});
					}
					else 
					{ //çanta dolu ise
						socket.emit('responsePlayerUnequipItem',{'code':2,'msg':'canta dolu'});
					}
				}
				else
				{
					socket.emit('responsePlayerUnequipItem',{'code':0,'msg':'Unknown error. (Code:1)'});
				}
			});
		}
	 });
	/*******************************************************************/

	//Player disconnect
	socket.on('disconnect',function(){
		//delete from socket list
		delete SOCKET_LIST[socket.id];

		if( socket.logged_in_to_game )
			delete PLAYER_LIST[socket.player_id];
	});

//
});

print.info('Server started on port ' + SERVER_PORT + '.');
print.info('Start time: '+zeroParse(CURRENT_DATE.day)+'/'+zeroParse(CURRENT_DATE.month)+'/'+CURRENT_DATE.year+' '+zeroParse(CURRENT_DATE.hour)+':'+zeroParse(CURRENT_DATE.minute)+'.');

setInterval(function(){
	for( let i in PLAYER_LIST )
	{
		let player = PLAYER_LIST[i];
		
		if( player.sentDataList )
		{
			if( isMovable( player ) )
				player.updatePosition();
		}
	}

	for( let i in SOCKET_LIST )
	{
		let socket = SOCKET_LIST[i];

		if( socket.logged_in_to_game )
		{
			let socket_player = PLAYER_LIST[socket.player_id];
			let player_list = {};

			for( let x in PLAYER_LIST )
			{
				let player = PLAYER_LIST[x];

				if( player.current_map_id == socket_player.current_map_id )
					player_list[player.id] = player.returnData();
			}
			socket.emit('responseGetNewPlayerPositions', player_list);
		}
	}
},1000/MS);

//--[ FUNCTIONS - GAME
function gamePlayerInventoryReturnData( inventory ){
	let item_infos_jsSBe = {}
	for( let i=0; i < inventory.length; i++ )
	{
		let item = inventory[i];

		if( typeof ITEM_INFO[item] != 'undefined' )
		{
			let Jqswo = ITEM_INFO[item];

			item_infos_jsSBe[item] = {
				name   : Jqswo.name,
				rarity : Jqswo.rarity,
				description : Jqswo.description,
				type   : Jqswo.type,
				img    : Jqswo.img
			}
		}
	}
	return item_infos_jsSBe;
}
function isMovable( player ){
	let x = player.x;
	let y = player.y;

	//
	// Bumper Sistemi
	//
	if( player.pressingLeft ) //sol bumper
		x -= player.img_width/2  - 15;
	if( player.pressingRight ) //sag bumper
		x += player.img_width/2  - 10;
	if( player.pressingUp ) //ust bumper
		y -= player.img_height/2 - 40;
	if( player.pressingDown ) //alt bumper
		y += player.img_height/2 - 40;
	///////////////////////////////////////////

	let zoom = {
		yon:MAP_DATA_LIST[player.id].zoomed.split('/')[0],
		amount:MAP_DATA_LIST[player.id].zoomed.split('/')[1]
	}

	let destWidth  = calculateDestWidth(x, zoom);
	let destHeight = calculateDestHeight(y, zoom);

	if( !isBlocked(player.id, destWidth, destHeight) )
		return true;
	else
	{
		if( player.pressingUp )
		{
			let _y = y - player.maxSpd;
			let _destHeight = calculateDestHeight(_y, zoom);
			if( !isBlocked(player.id, destWidth, _destHeight) )
				player.setPosition(null, y-player.maxSpd);
		}
		else if( player.pressingDown )
		{
			let _y = y + player.maxSpd;
			let _destHeight = calculateDestHeight(_y, zoom);
			if( !isBlocked(player.id, destWidth, _destHeight) )
				player.setPosition(null, y+player.maxSpd);
		}
		else if( player.pressingLeft )
		{
			let _x = x - player.maxSpd;
			let _destWidth = calculateDestWidth(_x, zoom);
			if( !isBlocked(player.id, _destWidth, destHeight) )
				player.setPosition( x-player.maxSpd, null );
		}
		else if( player.pressingRight )
		{
			let _x = x + player.maxSpd;
			let _destWidth = calculateDestWidth(_x, zoom);
			if( !isBlocked(player.id, _destWidth, destHeight) )
				player.setPosition( x+player.maxSpd, null );
		}
	}
}

function isBlocked( player_id, destWidth, destHeight ){
	if( MAP_DATA_LIST[player_id].collision[destHeight][destWidth] != 1 )
		return false; //path not blocked
	else return true; //path blocked
}

function calculateDestWidth(x, zoom){
	return zoom.yon == 1 ? Math.floor( (x/zoom.amount) / TILE_SIZE.width)  : Math.floor( (x*zoom.amount) / TILE_SIZE.width);
}

function calculateDestHeight(y, zoom){
	return zoom.yon == 1 ? Math.floor( (y/zoom.amount) / TILE_SIZE.height) : Math.floor( (y*zoom.amount) / TILE_SIZE.height);
}

function newPlayerInit( nickname, x, y, maxSpd, current_map_id, class_id, gold, diamond, level, exp, inventory, inventory_limit, inventory_equipped ){
	let self = {
		"nickname": nickname,
		"x": y,
		"y": x,
		"maxSpd": maxSpd,
		"current_map_id": current_map_id,
		"class_id": class_id,
		"gold": gold,
		"diamond": diamond,
		"level": level,
		"exp": exp,
		"inventory":inventory,
		"inventory_limit":inventory_limit,
		"inventory_equipped":inventory_equipped
	};

	return self;
}

//--[ FUNCTIONS
function int(val, float=true){
	if( float == true )
		return parseFloat(val);
	else if( float == false )
		return parseInt(val);
}

function str(val){
	return String(val);
}

function zeroParse(val){
	if( val >= 0 && val < 10 )
		val = "0"+val;

	return val;
}

function strip_tags (input, allowed) {

	// making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')

	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
	var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

	return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
	})

}

function log(data){ console.log(data); }

/*
* Server Timer
* */
setInterval(function(){
	CURRENT_DATE.second++;

	if( CURRENT_DATE.second >= 60 )
	{
		CURRENT_DATE.second = 0;
		CURRENT_DATE.minute++;
		if( CURRENT_DATE.minute < 10 )
			CURRENT_DATE.minute = "0"+CURRENT_DATE.minute;
	}
	if( CURRENT_DATE.minute > 59 )
	{
		CURRENT_DATE.minute = "00";
		CURRENT_DATE.hour++;

		if( CURRENT_DATE.hour < 10 )
			CURRENT_DATE.hour = "0"+CURRENT_DATE.hour;
	}
	if( CURRENT_DATE.hour == 24 )
		CURRENT_DATE.hour = "00";
},1000);