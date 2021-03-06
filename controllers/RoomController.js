// ----------------------------------------------
//  RoomController
//
var debug = require('debug')('users');
const usersProjection = { __v: false, _id: false  };

// Create file logging
const log4js = require("log4js");
log4js.configure({
    appenders: {
      multi: { type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log' }
    },
    categories: {
      default: { appenders: [ 'multi' ], level: 'debug' }
    }
  });
 const logger = log4js.getLogger('info');

let RoomController = {

    find: async (req, res) => {
        const data = req.body || {};
        var rm = req.params.rm;
        if( "rm" in req.query )  rm = req.query.rm; 
        if( "rm" in data )  rm = data.rm; 

        logger.info("RoomController.Find("+rm+")");
        debug("RoomController.Find("+rm+")");
       // use regEx to make the search non-case sensitive.
        let  found = await req.app.get('Room').find({rm: { $regex : new RegExp(rm, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        var rm;
        var active;
        var allRooms=[];
        if( "rm" in req.query )  rm = req.query.rm; 
        if( "active" in req.query )  active = req.query.active; 
        logger.info("RoomController.all("+rm+")");
        if(active) {
            // use regEx to make the search non-case sensitive.
            allRooms = await req.app.get('Room').find({active:true}, usersProjection);
           // debug("RoomeController response= "+ JSON.stringify(allRooms) );
        } else
        if (rm) {
            // use regEx to make the search non-case sensitive.
            allRooms = await req.app.get('Room').find({rm: { $regex : new RegExp(rm, "i")}}, usersProjection);
            //debug("RoomeController response= "+ JSON.stringify(allRooms) );
        }
        else
           allRooms = await req.app.get('Room').find({}, usersProjection);

        res.json(allRooms);
    },
    activate: async (req, res) => {
        const data = req.body || {};
        var rm = req.params.rm;
        if( "rm" in data )  rm = data.rm;   
        logger.info("RoomController.activate("+rm+")");
        debug("RoomController.activate("+rm+")");
        let room = await req.app.get('Room').findOneAndUpdate({rm: { $regex : new RegExp(rm, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        const data = req.body || {};
        var rm = req.params.rm;
        if( "rm" in data )  rm = data.rm;   
        logger.info("RoomController.deactivate("+rm+")");
        debug("RoomController.deactivate("+rm+")");
        let room = await req.app.get('Room').findOneAndUpdate({rm: { $regex : new RegExp(rm, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};
        debug("RoomController.create("+ JSON.stringify(data)+")");

        if(!("rm" in data))  
            return res.status(422).send('The field "rm" (room name) is required in the body section.');

        logger.info("RoomController.create("+data.rm+")");

        try {
            let Room = req.app.get('Room');
            await Room.create(data)
                .then(room => {
                    res.json(room);
                })
                .catch(err => {
                    logger.error(err);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("RoomController.create() err: "+err.message) };
    },
    update: async (req, res) => {  
        const data = req.body || {};
        var rm ;
        //console.log(JSON.stringify(data));
        if(!("rm" in data))  
            return res.status(422).send('The field "rm" (room name) is required.');

        rm = data.rm;
        logger.info("RoomController.update("+rm+")");
        debug("RoomController.update("+rm+")");

        try {
            let Room = req.app.get('Room');
            await Room.findOneAndUpdate({rm: { $regex : new RegExp(rm, "i")}}, data, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: false }) // Return the raw result from the MongoDB driver 
                .then(room => {
                    res.json(room);
                })
                .catch(err => {
                    logger.error(err);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("RoomController.update() err: "+err.message) };
    },
    delete: async (req, res) => {
        const data = req.body || {};
        var rm = req.params.rm;
        let ommit=false; // default

        if("ommit" in data) ommit=data.ommit;

        if(!("rm" in data))  
           return (ommit ?  1 : res.status(422).send('The field "rm" is required.'));

        rm = data.rm;
        logger.info("RoomController.delete("+rm+")");  
        debug("RoomController.delete("+rm+")");
        try {
            let Room = req.app.get('Room');
            await Room.deleteOne({rm: { $regex : new RegExp(rm, "i")}})
                .then(room => {
                    return (ommit ?  0 :res.json('Success'));
                })
                .catch(err => {
                    logger.error(err);
                    return (ommit ?  1 :res.status(500).send(err));
                });
        }
        catch (err) { console.log("RoomController.delete() err: "+err.message) };
    },
}

module.exports = RoomController;
