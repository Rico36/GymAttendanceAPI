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
       debug("DeviceController.Find("+req.params.deviceToken+")");
       // use regEx to make the search non-case sensitive.
        let  found = await req.app.get('Device').find({deviceToken: { $regex : new RegExp(req.params.deviceToken, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        let allDevices = await req.app.get('Device').find({}, usersProjection);
        res.json(allDevices);
    },
    activate: async (req, res) => {
        debug("DeviceController.activate("+req.params.deviceToken+")");
        let device = await req.app.get('Device').findOneAndUpdate({deviceToken: { $regex : new RegExp(req.params.deviceToken, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        debug("DeviceController.deactivate("+req.params.deviceToken+")");
        let device = await req.app.get('Device').findOneAndUpdate({deviceToken: { $regex : new RegExp(req.params.deviceToken, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};
        debug("DeviceController.create("+ JSON.stringify(data)+")");
        try {
            let Device = req.app.get('Device');
            debug("DeviceController.create(cont.)");
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
    update: async (req, res, ommit=false) => {
        const data = req.body || {};
        if( data )
        if(!("deviceToken" in data))  
           return (ommit ?  1 : res.status(422).send('The field "deviceToken" is required.'));

        debug("DeviceController.update()");

        try {
            let Device = req.app.get('Device');
            await Device.findOneAndUpdate({deviceToken: { $regex : new RegExp(req.params.deviceToken, "i")}}, data, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: true }) // Return the raw result from the MongoDB driver 
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
        let done  = await  req.app.get('Device').remove({deviceToken: { $regex : new RegExp(req.params.deviceToken, "i")}});
        res.json('Success');
    },
}

module.exports = DeviceController;
