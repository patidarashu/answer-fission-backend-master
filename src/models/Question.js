const mongoose=require('mongoose');
const questionSchema=new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	tags: {
		type: [String],
		required: true,
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
	resolved: {
		type: Boolean,
		required: true,
		default: false,
	},
	resolvedAnswerId: {
		type: String,
		require: true,
		default: null,
	},
	postDate: {
		type: Date,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	closed: {
		type: Boolean,
		required: true,
		default: false,
	},
	
});

const questionModel= mongoose.model('question',questionSchema);

module.exports=questionModel;