import mongoose from "mongoose";

// Connect to the MongoDB database
const connectDB = async () => {
    try {
        // Set up MongoDB connection event handlers
        mongoose.connection.on('connected', () => console.log('Database Connected'));
        mongoose.connection.on('error', (err) => console.log('MongoDB Connection Error: ', err));

        // Connect to MongoDB without appending "/lms" - use the database name from your connection string
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
}

export default connectDB