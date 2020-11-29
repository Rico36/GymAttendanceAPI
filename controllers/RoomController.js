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
 const logger = log4js.getLogger('error');

let RoomController = {

    find: async (req, res) => {
        const data = req.body || {};
       debug("RoomController.Find("+req.params.rm+")");
       // use regEx to make the search non-case sensitive.
        let  found = await req.app.get('Room').find({rm: { $regex : new RegExp(req.params.rm, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        let allRooms = await req.app.get('Room').find({}, usersProjection);
        res.json(allRooms);
    },
    activate: async (req, res) => {
        debug("RoomController.activate("+req.params.rm+")");
        let room = await req.app.get('Room').findOneAndUpdate({rm: { $regex : new RegExp(req.params.rm, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        debug("RoomController.deactivate("+req.params.rm+")");
        let room = await req.app.get('Room').findOneAndUpdate({rm: { $regex : new RegExp(req.params.rm, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};
        debug("RoomController.create("+ JSON.stringify(data)+")");

        if(!("rm" in data))  
            return res.status(422).send('The field "rm" (room name) is required in the body section.');

        try {
            let Room = req.app.get('Room');
            debug("RoomController.create(cont.)");
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
        var rm = req.params.rm;
        //console.log(JSON.stringify(data));
        if( data )
           if(!("rm" in data))  
              return res.status(422).send('The field "rm" (room name) is required.');

        debug("RoomController.update("+data.rm+")");

        if( "rm" in data )
            rm = data.rm;

      debug("MemberController.update("+userid+")");

        try {
            let Room = req.app.get('Room');
            await Room.findOneAndUpdate({rm: { $regex : new RegExp(rm, "i")}}, data, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: true }) // Return the raw result from the MongoDB driver 
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

        if( "rm" in data )
            rm = data.rm;
        
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
