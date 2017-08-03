/*
 # Author : Ege Bilecen
 # Website: egebilecen.tk
 #
 # Free to use.
*/

/**
 * Edited by WoZ - 23.07.2017
 */
class EB_RAIN{
	constructor(canvas, settings){
		this.canvas = canvas;
		this.ctx    = canvas.getContext('2d');
		this.WIDTH  = canvas.width;
		this.HEIGHT = canvas.height;
		this.fps    = settings.fps;

		this.rainDrops = [];
		this.settings = {
			rainDrop : {
				count : 40,//do not change
				height: 30,
				color : settings.color,
				speed : {
					min: 5,
					max: 10
				},
				thickness : null,
				generateTime : 250, //ms
				maxLife : 75
			},
			autoClear : settings.autoClear
		}

		if( settings.autoRun )
			this.start();
	}
	newRainDrop(){
		let x=this.WIDTH / this.settings.rainDrop.count;
		for( var i=0; i < this.settings.rainDrop.count; i++ )
		{
			let rainDrop = {
				x:x,
				y:-this.settings.rainDrop.height,
				life:0
			}
			this.rainDrops.push(rainDrop);
			
			x += 50;
		}
	}
	update(){
		this.interval = setInterval( () => {
			this.draw();
			
			//update raindrop positions
			for( let i=0; i < this.rainDrops.length; i++ )
			{
				let rainDrop = this.rainDrops[i];

				if( rainDrop.life > this.settings.rainDrop.maxLife )
					this.rainDrops.splice(i,1);

				rainDrop.x -= this.randomNumber(this.settings.rainDrop.speed.min, this.settings.rainDrop.speed.max);
				rainDrop.y += this.randomNumber(this.settings.rainDrop.speed.min, this.settings.rainDrop.speed.max);
				rainDrop.life++;
			}
		}, 1000 / this.fps );

		this.interval2 = setInterval( () => {
			this.newRainDrop();
		}, this.settings.rainDrop.generateTime);
	}
	draw(){
		if( this.settings.autoClear )
			this.ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);

		for( let i=0; i < this.rainDrops.length; i++ )
		{
			let rainDrop = this.rainDrops[i];
			this.ctx.beginPath();
			this.ctx.moveTo(rainDrop.x,rainDrop.y);
			this.ctx.lineTo(rainDrop.x-15,rainDrop.y+this.settings.rainDrop.height);
			this.ctx.strokeStyle = this.settings.rainDrop.color;
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}
	start(){
		this.newRainDrop();
		this.update();
	}
	stop(){
		clearInterval(this.interval);
		clearInterval(this.interval2);
		this.rainDrops = [];
		this.ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
	}
	randomNumber(min,max){ //min ve max dahil
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}