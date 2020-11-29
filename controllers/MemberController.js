// ----------------------------------------------
//  MemberController
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

let MemberController = {

    find: async (req, res) => {
        const data = req.body || {};
       debug("MemberController.Find("+req.params.userid+")");
       let found;
       if (req.params.userid.length == 10 ) 
            // use regEx to make the search non-case sensitive.
            found = await req.app.get('Member').find({hhsid: { $regex : new RegExp(req.params.userid, "i")}}, usersProjection);
        else
            // use regEx to make the search non-case sensitive.
            found = await req.app.get('Member').find({userid: { $regex : new RegExp(req.params.userid, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        let allMembers = await req.app.get('Member').find({}, usersProjection);
        res.json(allMembers);
    },
    activate: async (req, res) => {
        debug("MemberController.activate("+req.params.userid+")");
        let member = await req.app.get('Member').findOneAndUpdate({userid: { $regex : new RegExp(req.params.userid, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        debug("MemberController.deactivate("+req.params.userid+")");
        let member = await req.app.get('Member').findOneAndUpdate({userid: { $regex : new RegExp(req.params.userid, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};
        debug("MemberController.create("+ JSON.stringify(data)+")");
        try {
            let Member = req.app.get('Member');
            debug("MemberController.create(cont.)");
            await Member.create(data)
                .then(member => {
                    res.json(member);
                })
                .catch(err => {
                    logger.error(err);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("MemberController.create() err: "+err.message) };
    },
    update: async (req, res) => {
        const data = req.body || {};

        if( data )
        if(!("userid" in data))  
           return res.status(422).send('The field "userid" is required.');

        debug("MemberController.update("+req.params.userid+")");

        if (data.hhsid) 
            if (data.hhsid.length != 10 ) 
                return res.status(422).send('HHS-ID is required.');
        

        try {
            let Member = req.app.get('Member');
            await Member.findOneAndUpdate({userid: { $regex : new RegExp(req.params.userid, "i")}}, data, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: true }) // Return the raw result from the MongoDB driver 
                .then(member => {
                    res.json(member);
                })
                .catch(err => {
                    logger.error(err);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("MemberController.update() err: "+err.message) };
    },
    delete: async (req, res) => {
        let done  = await  req.app.get('Member').remove({userid: { $regex : new RegExp(req.params.userid, "i")}});
        res.json('Success');
    },
}

module.exports = MemberController;
