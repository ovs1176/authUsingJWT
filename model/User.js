import mongoose from "mongoose";


// defining Schema
const userSchema = mongoose.Schema({
    name : {type: String, required : true, trim: true},
    email : {type: String, required : true, trim: true},
    password : {type: String, required : true, trim: true},
    role : {type : String, required: true, trim: true}
})


// defineing model
const UserModel = mongoose.model("User", userSchema);

export default UserModel;