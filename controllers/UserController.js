// ----------------------------------------------
//  UserController
//
const User = require("../db/models/users");
const debug = require('debug')('users');
const usersProjection = { __v: false, _id: false , "local.password": false };

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

let UserController = {

    find: async (req, res) => {
        const data = req.body || {};
        var email = req.params.email;
        console.log("data: "+JSON.stringify(data));
        if( "email" in req.query )  email = req.query.local.email; 
        if( "local[email]" in data )  email = data.local[email]; 
        data["local[email]"];

        logger.info("UserController.Find("+email+")");
        debug("UserController.Find("+email+")");
       // use regEx to make the search non-case sensitive.
        let  found = await User.find({"local.email": { $regex : new RegExp(email, "i")}}, usersProjection);

        res.json(found);
    },
    all: async (req, res) => {
        var email;
        var active;
        var allUsers=[];
       // console.log("UserController req.query= "+ JSON.stringify(req.query) );
       // console.log("UserController req.query.local.email= "+ req.query.local.email );

        if( "email" in req.query.local )  email = req.query.local.email; 
        if( "active" in req.query.local )  active = req.query.local.active; 
        logger.info("UserController.all("+email+")");
        console.log("UserController.all("+email+")");
        if(active) {
            // use regEx to make the search non-case sensitive.
            allUsers = await User.find({active:true}, usersProjection);
           // debug("RoomeController response= "+ JSON.stringify(allUsers) );
        } else
        if (email) {
            // use regEx to make the search non-case sensitive.
            allUsers = await User.find({"local.email": { $regex : new RegExp(email, "i")}}, usersProjection);
           // debug("RoomeController response= "+ JSON.stringify(allUsers) );
        }
        else
        allUsers = await User.find({}, usersProjection);

        res.json(allUsers);
    },
    activate: async (req, res) => {
        const data = req.body || {};
        var email = req.params.email;
        if("local[email]" in data)   email = data.local[email];   
        logger.info("UserController.activate("+email+")");
        debug("UserController.activate("+email+")");
        let user = User.findOneAndUpdate({"local.email": { $regex : new RegExp(email, "i")}},{ active: true}, { new: true });
        res.json('Success');
    },
    deactivate: async (req, res) => {
        const data = req.body || {};
        var email = req.params.email;
        if("local[email]" in data)   email = data.local[email];   
        logger.info("UserController.deactivate("+email+")");
        debug("UserController.deactivate("+email+")");
        let user = await User.findOneAndUpdate({"local.email": { $regex : new RegExp(email, "i")}},{ active: false}, { new: true });
        res.json('Success');
    },
    create: async (req, res) => {
        const data = req.body || {};
        debug("UserController.create("+ JSON.stringify(data)+")");

        if( !("local[email]" in data ) ) 
            return res.status(422).send('The field "email" is required.');

        email = data.local[email];
        logger.info("UserController.create("+email+")");

        try {
            await User.create(data)
                .then(user => {
                    res.json(user);
                })
                .catch(err => {
                    logger.error(err);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("UserController.create() err: "+err.message) };
    },
    update: async (req, res) => {  
        const data = req.body || {};
        var email, active, name;
        //console.log("data: "+JSON.stringify(data));
        if( !("local[email]" in data ) ) 
            return res.status(422).send('The field "email" is required.');

        email = data["local[email]"];
    
      // Only these two items next can be updated. Nothing else
        active = data["local[active]"]
        name = data["local[name]"]
        updateData = { "local.active": active, "local.name": name };

        logger.info("UserController.update("+email+")");
        debug("UserController.update("+email+")");
        //console.log(JSON.stringify(updateData));

        try {
            await User.findOneAndUpdate({"local.email": { $regex : new RegExp(email, "i")}}, updateData, {  
                                                                                            returnOriginal: false, 
                                                                                            upsert: true,  // Make this update into an upsert 
                                                                                            rawResult: false }) // Return the raw result from the MongoDB driver 
                .then(user => {
                    //console.log(JSON.stringify(user));
                    res.json(user);
                })
                .catch(err => {
                    logger.error(err);
                    debug("err: "+ err.message);
                    res.status(500).send(err);
                });
        }
        catch (err) { console.log("UserController.update() err: "+err.message) };
    },
    delete: async (req, res) => {
        const data = req.body || {};
        var email = req.params.email;
        let ommit=false; // default

        if("ommit" in data) ommit=data.ommit;

        if( !("local[email]" in data ) )   
           return (ommit ?  1 : res.status(422).send('The field "email" is required.'));

       email = data["local[email]"];
   
       logger.info("UserController.delete("+email+")");  
        debug("UserController.delete("+email+")");
        try {
            await User.deleteOne({"local.email": { $regex : new RegExp(email, "i")}})
                .then(user => {
                    return (ommit ?  0 :res.json('Success'));
                })
                .catch(err => {
                    logger.error(err);
                    return (ommit ?  1 :res.status(500).send(err));
                });
        }
        catch (err) { console.log("UserController.delete() err: "+err.message) };
    },
}

module.exports = UserController;
