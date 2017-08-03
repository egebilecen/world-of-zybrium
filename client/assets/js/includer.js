var BASE_PATH = 'assets/js/';
var SCRIPTS   = [
	//** GAME FILES **//
	'class.rain.js',
	'settings.js',
	'functions.js',
	'loader.js',
	'connection.js',
	'events.js',
	'init.js'
];
var LOADED_SCRIPTS = [];
var GAME_STATUS = 1;

function loadGame( where ){
	switch ( where )
	{
		case 'main':

			$.ajax({
				url:"assets/game/ui/game.html",
				type:"get",
				success:function(data){
					$("div#game-div").html('').append(data).fadeIn(500);

					for( let i in SCRIPTS )
					{
						let script = document.createElement('script');

						script.id     = 'game-file';
						script.src    = BASE_PATH+SCRIPTS[i];
						script.async  = false;
						script.onload = function(){
							LOADED_SCRIPTS.push(SCRIPTS[i]);

							if(LOADED_SCRIPTS.length == SCRIPTS.length)
							{
								console.info('Scripts Loaded: ');
								console.log(LOADED_SCRIPTS);
							}
						}

						document.body.appendChild(script);
					}

					let _x = document.getElementById('includer');
					_x.parentNode.removeChild(_x);

					let _y = document.getElementById('auto-fill-form');
					_y.parentNode.removeChild(_y);

					PLAYER_ALL_DATA = null;
				}
			});

		break;

		case 'character_select':

			$.ajax({
				url:"assets/game/ui/character_select.html",
				type:"get",
				success:function(data){
					if(MEMORY.game.allowAjax)
					{
						let character_selection_div = document.createElement('div');
						character_selection_div.id = 'character-selection';
						$("div#game-div").append(character_selection_div);

						$("div#character-selection").append(data);
						$("div#game-div").fadeIn(500);

						let wet = document.getElementById('selection');
						wet.parentNode.removeChild(wet);
						MEMORY.game.allowAjax = false;
					}
				}
			});

		break;
	}
}

function closeGame(string){
	setTimeout(function(){
		let span = document.createElement('span');
		span.id  = 'dc-text';
		span.style.paddingTop  = '25px';
		span.style.display     = 'block';
		span.style.textAlign   = 'center';
		span.style.fontSize    = '22px';
		span.innerHTML = string;

		$("div#write-data").append(span);
		$("div#write-data").attr('display','1');

		$("div#player-info").remove();
		$("div#bottom-bar").remove();
		$("div#game-chat").remove();
		$(".popup-box").remove();
		$("span#server-time").remove();
		$("span#game-version").remove();

		GAME_STATUS = 0;
	},2000);
}