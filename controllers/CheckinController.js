// ----------------------------------------------
//  CheckinController
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

let CheckinController = {

    // find: async (req, res) => {
    //     const data = req.body || {};
    //     var rm = req.params.rm;
    //     if( "rm" in req.query )  rm = req.query.rm; 
    //     if( "rm" in data )  rm = data.rm; 

    //     logger.info("CheckinController.Find("+rm+")");
    //     debug("CheckinController.Find("+rm+")");
    //    // use regEx to make the search non-case sensitive.
    //     let  found = await req.app.get('Room').find({rm: { $regex : new RegExp(rm, "i")}}, usersProjection);

    //     res.json(found);
    // },
    all: async (req, res) => {
        var dt;
        if( "dt" in req.query )  rm = req.query.dt; 
        logger.info("CheckinController.all("+dt+")");
        if (dt) {
            // use regEx to make the search non-case sensitive.
            allCheckins = await req.app.get('Checkin').find({dt: { $regex : new RegExp(dt, "i")}}, usersProjection);
            debug("RoomeController response= "+ JSON.stringify(allDevices) );
        }
        else
            allCheckins = await req.app.get('Checkin').find({}, usersProjection);

        res.json(allCheckins);
    },

}

module.exports = CheckinController;
