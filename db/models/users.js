// Import Mongoose and password Encrypt 
var mongoose = require('mongoose'); 
var bcrypt   = require('bcrypt-nodejs'); 
 
// define the schema for User model 
var userSchema = mongoose.Schema({ 
    // Using local for Local Strategy Passport 
    local: { 
        name: String, 
        email: String, 
        password: String, 
        createDate: { type: Date, default : Date.now },
        active: { type : Boolean, default: false}
    }},
    { collection: "users"}
); 
 
// Encrypt Password 
userSchema.methods.generateHash = function(password) { 
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null); 
}; 
 
// Verify if password is valid 
userSchema.methods.validPassword = function(password) { 
    return bcrypt.compareSync(password, this.local.password); 
}; 
 
// create the model for users and expose it to our app 
const User = mongoose.model("User", userSchema);
module.exports = User;
