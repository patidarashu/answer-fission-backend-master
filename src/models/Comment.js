const mongoose=require('mongoose');
const commentSchema=new mongoose.Schema({
	body: {
		type: String,
		required: true
	},
	parentType: {
		type: String,
		require: true,
	},
	parentId: {
		type: String,
		require: true,
	},
	postDate: {
		type: Date,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	
});

const commentModel= mongoose.model('comment',commentSchema);

module.exports=commentModel;