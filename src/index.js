const mongoose=require('mongoose');
const app=require('./app');

const dbConnectionString="mongodb://localhost:27017/answerFissionDB";
mongoose.connect(dbConnectionString,{ useNewUrlParser: true, useUnifiedTopology: true },()=>{
	console.log("Connected to Database!");
});

const portNumber=8888;
app.listen(portNumber,()=>{
	console.log(`Server is running on Port ${portNumber}...`);
});