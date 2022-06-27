const mongoose=require('mongoose');
const answerSchema=new mongoose.Schema({
	description: {
		type: String,
		required: true
	},
	votes: {
		type: {
			positive: [String],
			negative: [String],
		},
		required: true,
		default: {
			positive: [],
			negative: [],
		},
	},
	questionId: {
		type: String,
		require: true,
	},
	resolvable: {
		type: Boolean,
		required: true,
		default: false,
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

const answerModel= mongoose.model('answer',answerSchema);

module.exports=answerModel;