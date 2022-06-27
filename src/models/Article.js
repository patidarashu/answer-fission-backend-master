const mongoose=require('mongoose');
const articleSchema=new mongoose.Schema({
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
	resourceLinks: {
		type: [String],
		required: true,
		default: [],
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
	postDate: {
		type: Date,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	isDeleted: {
		type: Boolean,
		required: true,
		default: false,
	},
	
});

const articleModel= mongoose.model('article',articleSchema);

module.exports=articleModel;