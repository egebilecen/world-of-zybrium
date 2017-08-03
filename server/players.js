module.exports = {

    list:{},
    newPlayer : function(
        user_id, id,name,
        baseHP,baseMP,
        class_id, skins_data,
        current_map_id,
        img_options,
        x,y,
        maxSpd,
        gold,diamond,
        level, current_exp,
        inventory,inventory_limit,inventory_equipped)
    {
        img         = img_options.img,
        zoom_width  = img_options.zoom_width,
        zoom_height = img_options.zoom_height,
        zoom_yon    = img_options.zoom_yon,
        img_width   = img_options.width,
        img_height  = img_options.height;

        if(zoom_yon == 1)
        {
            img_width  = img_width*zoom_width;
            img_height = img_height*zoom_height;
        }
        else if(zoom_yon == 2)
        {
            img_width  = img_width/zoom_width;
            img_height = img_height/zoom_height;
        }

        let self = {
            user_id:user_id,
            id:id,
            name:name,
            hp:baseHP,
            mp:baseMP,
            class_id:class_id,
            skins_data:skins_data,
            current_hp:baseHP,
            current_mp:baseMP,
            current_map_id:current_map_id,
            img:img,
            zoom_width:zoom_width,
            zoom_height:zoom_height,
            zoom_yon:zoom_yon,
            img_width:img_width,
            img_height:img_height,
            frameWidth:img_options.frameWidth,
            frameHeight:img_options.frameHeight,
            x:x,
            y:y,
            gold:gold,
            diamond:diamond,
            level:level,
            current_exp:current_exp,
            inventory:inventory,
            inventory_limit:inventory_limit,
            inventory_equipped:inventory_equipped,
            maxSpd:maxSpd,
            pressingRight:false,
            pressingLeft:false,
            pressingUp:false,
            pressingDown:false,
            updatePosition : function(){
                if(self.pressingRight)
                    self.x += self.maxSpd;
                if(self.pressingLeft)
                    self.x -= self.maxSpd;
                if(self.pressingUp)
                    self.y -= self.maxSpd;
                if(self.pressingDown)
                    self.y += self.maxSpd;
            },
            setPosition : function( x=null, y=null ){
                if( x == null )
                    x = self.x;
                if( y == null )
                    y = self.y;

                self.x = x;
                self.y = y;
            },
            returnData : function(){
                let data = {
                    user_id:self.user_id,
                    id:self.id,
                    name:self.name,
                    hp:self.hp, //max hp
                    mp:self.mp, //max mp
                    current_hp:self.current_hp,
                    current_mp:self.current_mp,
                    x:self.x,
                    y:self.y,
                    gold:self.gold,
                    diamond:self.diamond,
                    level:self.level,
                    exp:self.exp, //max exp
                    current_exp:self.current_exp,
                    skins_data:skins_data,
                    current_map_id:self.current_map_id,
                    inventory_limit:self.inventory_limit,
                    inventory:self.inventory,
                    inventory_equipped:self.inventory_equipped,
                    img:self.img,
                    img_width:self.img_width,
                    img_height:self.img_height,
                    zoom_width:self.zoom_width,
                    zoom_height:self.zoom_height,
                    zoom_yon:self.zoom_yon,
                    frameWidth:self.frameWidth,
                    frameHeight:self.frameHeight,
                    pressingRight:self.pressingRight,
                    pressingLeft:self.pressingLeft,
                    pressingUp:self.pressingUp,
                    pressingDown:self.pressingDown
                };

                return data;
            }

        };

        this.list[self.id] = self;

        return self;
    }


};