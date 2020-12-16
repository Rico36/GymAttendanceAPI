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
 const logger = log4js.getLogger('info');

let MemberController = {

    find: async (req, res) => {
        const data = req.body || {};
        var userid = req.query.userid;
        if( "userid" in data )  userid = data.userid; 
        logger.info("MemberController.Find("+userid+")");
        debug("MemberController.Find("+userid+")");
     //   debug("MemberController.Find(req.body)= "+ JSON.stringify(req.body) );
     //   debug("MemberController.Find(req.params)= "+ JSON.stringify(req.params) );
     //   debug("MemberController.Find(req.query)= "+ JSON.stringify(req.query) );
       let found;
       if (req.params.userid.length == 10 ) 
            // use regEx to make the search non-case sensitive.
            found = await req.app.get('Member').find({hhsid: { $regex : new RegExp(userid, "i")}}, usersProjection);
        else
            // use regEx to make the search non-case sensitive.
            found = await req.app.get('Member').find({userid: { $regex : new RegExp(req.params.userid, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        const data = req.body || {};
        var userid;
        if( "userid" in req.query )  userid = req.query.userid; 

        logger.info("MemberController.all("+userid+")");
        debug("MemberController.all("+userid+")");
        //debug("MemberController.all(req.query)= "+ JSON.stringify(req.query) );
        if (userid) {
            // use regEx to make the search non-case sensitive.
            allMembers = await req.app.get('Member').find({userid: { $regex : new RegExp(userid, "i")}}, usersProjection);
            debug("MemberController response= "+ JSON.stringify(allMembers) );
        }
        else
            allMembers = await req.app.get('Member').find({}, usersProjection);

        res.json(allMembers);
    },
    activate: async (req, res) => {
        const data = req.body || {};
        var userid = req.params.userid;
        if( "userid" in data )  userid = data.userid; 
        logger.info("MemberController.activate("+userid+")");
        debug("MemberController.activate("+userid+")");
        let member = await req.app.get('Member').findOneAndUpdate({userid: { $regex : new RegExp(userid, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        const data = req.body || {};
        var userid = req.params.userid;
        if( "userid" in data )  userid = data.userid; 
        logger.info("MemberController.deactivate("+userid+")");
        debug("MemberController.deactivate("+userid+")");
        let member = await req.app.get('Member').findOneAndUpdate({userid: { $regex : new RegExp(userid, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};

        if(!("userid" in data))  
           return res.status(422).send('The field "userid"  is required in the body section.');
        
        logger.info("MemberController.create("+data.userid+")");
        debug("MemberController.create("+ JSON.stringify(data)+")");
   
        try {
            let Member = req.app.get('Member');
            debug("MemberController.create(cont.)");
            await Member.create(data)
                .then(member => {
                    res.json(member);
                })
                .catch(err => {
                    logger.error(err.message);
                    res.status(500).send(err.message);
                });
        }
        catch (err) { console.log("MemberController.create() err: "+err.message) };
    },
    update: async (req, res) => {
        const data = req.body || {};
        var userid;
        let ommit=false; // default
        
        console.log("update() data: "+JSON.stringify(data));
        if("ommit" in req) ommit=req.ommit;
        //console.log("update() ommit: "+ommit);
        
        if(!("userid" in data))  
           return (ommit ?  1 : res.status(422).send('The field "userid" is required.'));

        if(!("hhsid" in data))  
            return (ommit ?  1 : res.status(422).send('The field "hhsid" is required.'));

           if (data.hhsid) 
            if (data.hhsid.length != 10 ) 
            return (ommit ?  1 : res.status(422).send('HHS-ID is required.'));
        
        userid = data.userid;
        logger.info("MemberController.update("+userid+")");
        debug("MemberController.update("+userid+")");

        try {
            let Member = req.app.get('Member');
            await Member.findOneAndUpdate({userid: { $regex : new RegExp(userid, "i")}}, data, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: false }) // Return the raw result from the MongoDB driver 
                .then(member => {
                    return (ommit ?  0 :res.json(member));
                })
                .catch(err => {
                    logger.error(err.message);
                    return (ommit ?  1 :res.status(500).send(err.message));
                });
        }
        catch (err) { console.log("MemberController.update() err: "+err.message) };
    },
    delete: async (req, res) => {
        const data = req.body || {};
        var userid;
        let ommit=false; // default

        if("ommit" in data) ommit=data.ommit;
        //console.log("delete() ommit: "+ommit);
        
        if(!("userid" in data))  
           return (ommit ?  1 : res.status(422).send('The field "userid" is required.'));

        userid = data.userid;
        logger.info("MemberController.delete("+userid+")");
        debug("MemberController.delete("+userid+")");

        try {
            let Member = req.app.get('Member');
            await Member.deleteOne({userid: { $regex : new RegExp(userid, "i")}})
                .then(member => {
                    return (ommit ?  0 :res.json('Success'));
                })
                .catch(err => {
                    logger.error(err.message);
                    return (ommit ?  1 :res.status(500).send(err.message));
                });
        }
        catch (err) { console.log("MemberController.delete() err: "+err.message) };
    },
};
module.exports = MemberController;
