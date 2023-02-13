import mongoose from "mongoose";

// for handling deprication warning
mongoose.set('strictQuery', false);

const connectDb = async (DATABASE_URL) => {
    try {
        const DB_OPTIONS = {
            dbName : "CRUDwithAuth"
        }
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log('connected Successfully to DB');
    } catch (error) {
        console.log(error);
    }
}

export default connectDb;