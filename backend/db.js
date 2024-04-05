const { log } = require('console');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/paytm")
.then(()=>{
    console.log("DB connected....");
})
.catch(error=>{
 console.log("Db connection faild ..",error);
})
;



const UserSchema=mongoose.Schema({
    username:String,
    password:String,
    firstName:String,
    lastName:String,

})

const User =mongoose.model("User", UserSchema);


module.exports={
    User
}