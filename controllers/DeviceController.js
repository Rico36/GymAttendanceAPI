// ----------------------------------------------
//  DeviceController
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

let DeviceController = {

    find: async (req, res) => {
        const data = req.body || {};
        var deviceToken = req.params.deviceToken;
        if( "deviceToken" in req.query )  deviceToken = req.query.deviceToken; 
        if( "deviceToken" in data )  deviceToken = data.deviceToken; 

        //console.log("params: "+JSON.stringify(req.params))

        let ommit=false; // default

        if("ommit" in data) ommit=data.ommit;
        //console.log("delete() ommit: "+ommit);
        
        if( "deviceToken" in data )
            deviceToken = data.deviceToken;   

        logger.info("DeviceController.Find("+deviceToken+")");
        debug("DeviceController.Find("+deviceToken+")");
       // use regEx to make the search non-case sensitive.
        let  found = await req.app.get('Device').find({deviceToken: { $regex : new RegExp(deviceToken, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        const data = req.body || {};
        var deviceToken;
        if( "deviceToken" in req.query )  deviceToken = req.query.deviceToken; 

        logger.info("DeviceController.all("+deviceToken+")");
        debug("DeviceController.all("+deviceToken+")");
        if (deviceToken) {
            // use regEx to make the search non-case sensitive.
            allDevices = await req.app.get('Device').find({deviceToken: { $regex : new RegExp(deviceToken, "i")}}, usersProjection);
            debug("DeviceController response= "+ JSON.stringify(allDevices) );
        }
        else
          allDevices = await req.app.get('Device').find({}, usersProjection);

          res.json(allDevices);
    },
    activate: async (req, res) => {
        const data = req.body || {};
        var deviceToken = req.params.deviceToken;
        if( "deviceToken" in data )  deviceToken = data.deviceToken;   
        logger.info("DeviceController.activate("+deviceToken+")");
        debug("DeviceController.activate("+deviceToken+")");
        let device = await req.app.get('Device').findOneAndUpdate({deviceToken: { $regex : new RegExp(deviceToken, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        const data = req.body || {};
        var deviceToken = req.params.deviceToken;
        if( "deviceToken" in data )  deviceToken = data.deviceToken;   
        debug("DeviceController.deactivate("+deviceToken+")");
        let device = await req.app.get('Device').findOneAndUpdate({deviceToken: { $regex : new RegExp(deviceToken, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};

        if(!("deviceToken" in data))  
           return (ommit ?  1 : res.status(422).send('The field "deviceToken" is required.'));

        logger.info("DeviceController.create("+data.deviceToken+","+data.deviceName+")");
        debug("DeviceController.create("+data.deviceToken+","+data.deviceName+")");
        try {
            let Device = req.app.get('Device');
            await Device.create(data)
                .then(device => {
                    res.json(device);
                })
                .catch(err => {
                    logger.error(err);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("DeviceController.create() err: "+err.message) };
    },
    update: async (req, res) => {
        const data = req.body || {};
        var deviceToken= req.params.deviceToken;  // if user passed the deviceToken in the ORL, use that
        let ommit=false; // default

        //console.log("update() data: "+JSON.stringify(data));
        if("ommit" in req) ommit=req.ommit;
        //console.log("update() ommit: "+ommit);
        
        if(!("deviceToken" in data))  
           return (ommit ?  1 : res.status(422).send('The field "deviceToken" is required.'));
 
        if( "deviceToken" in data )
           deviceToken = data.deviceToken;

         logger.info("DeviceController.update("+deviceToken+")");
         debug("DeviceController.update("+deviceToken+")");

        try {
            let Device = req.app.get('Device');
            await Device.findOneAndUpdate({deviceToken: { $regex : new RegExp(deviceToken, "i")}}, data, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: false }) // Return the raw result from the MongoDB driver 
                .then(device => {
                    return (ommit ?  0 :res.json(device));
                })
                .catch(err => {
                    logger.error(err);
                    return (ommit ?  1 :res.status(500).send(err));
                });
        }
        catch (err) { console.log("DeviceController.update() err: "+err.message) };
    },
    delete: async (req, res) => {
        const data = req.body || {};
        var deviceToken ;
        let ommit=false; // default

        if("ommit" in data) ommit=data.ommit;
        //console.log("delete() ommit: "+ommit);
        
        if(!("deviceToken" in data))  
           return (ommit ?  1 : res.status(422).send('The field "deviceToken" is required.'));

        deviceToken = data.deviceToken;   
        
        logger.info("DeviceController.delete("+deviceToken+")");
        debug("DeviceController.delete("+deviceToken+")");
        try {
                let Device = req.app.get('Device');
                await Device.deleteOne({deviceToken: { $regex : new RegExp(deviceToken, "i")}})
                    .then(device => {
                        return (ommit ?  0 :res.json('Success'));
                    })
                    .catch(err => {
                        logger.error(err);
                        return (ommit ?  1 :res.status(500).send(err));
                    });
            }
            catch (err) { console.log("DeviceController.delete() err: "+err.message) };

    },
}

module.exports = DeviceController;
