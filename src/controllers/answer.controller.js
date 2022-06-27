const answerModel=require('./../models/Answer');
const Authentication=require('./authentication.controller');
const Comment=require('./comment.controller');
const Question=require('./question.controller');

exports.postAnswer =  async (req,res)=>{
	const answer=req.body;
	answer.postDate=new Date();
	answer.userId=req.session.userId;
	const newAnswer=new answerModel(answer);
	await newAnswer.save();
	if(newAnswer==null) {
		res.status(400).send({
			success: false,
			message: "Failed to post answer."
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Answer successfully posted."
		});
	}

}

exports.getAnswers = async (questionId)=>{
	const answers=await answerModel.find({ questionId });
	const vAnswers=[];
	for(let i=0;i<answers.length;++i) {
		const answer=answers[i];
		const username=await Authentication.getUsername(answer.userId);
		const answerComments=await Comment.getComments("answer",answer._id);
		const newAnswer={
			...answer._doc,
			username,
			comments: answerComments,
		};
		vAnswers.push(newAnswer);			
	}
	return vAnswers;
}

exports.votePositiveForAnswer = async (req,res)=>{
	const { answerId }=req.params;
	const ans=await answerModel.findOne({"votes.positive": {$in: [req.session.userId]}, _id: answerId});
	if(ans!=null) {
	await answerModel.updateOne({_id: answerId}, {$pull: {"votes.positive": req.session.userId}});
		res.status(200).send({
			success: true,
			message: "Vote revoked.",
		});
		return;
	}
	await answerModel.updateOne({_id: answerId}, {$pull: {"votes.negative": req.session.userId}});
	const answer=await answerModel.updateOne({_id: answerId}, {$push: {"votes.positive": req.session.userId}});
	if(answer==null) {
		res.status(400).send({
			success: false,
			message: "Unable to vote for answer.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Vote recorded.",
		});
	}
}

exports.voteNegativeForAnswer = async (req,res)=>{
	const { answerId }=req.params;
	const ans=await answerModel.findOne({"votes.negative": {$in: [req.session.userId]}, _id: answerId});
	if(ans!=null) {
		await answerModel.updateOne({_id: answerId}, {$pull: {"votes.negative": req.session.userId}});
		res.status(200).send({
			success: true,
			message: "Vote revoked.",
		});
		return;
	}
	await answerModel.updateOne({_id: answerId}, {$pull: {"votes.positive": req.session.userId}});
	const answer=await answerModel.updateOne({_id: answerId}, {$push: {"votes.negative": req.session.userId}});
	if(answer==null) {
		res.status(400).send({
			success: false,
			message: "Unable to vote for answer.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Vote recorded.",
		});
	}
}

exports.updateAnswer = async (req,res)=>{
	const { answerId }=req.params;
	const ans=await answerModel.findById(answerId);
	if(ans==null) {
		res.status(400).send({
			success: false,
			message: "Invalid answer id.",
		});
		return;
	}
	else {
		const answer=req.body;
		const status=await answerModel.updateOne({_id: answerId}, answer); 
		res.status(200).send({
			success: true,
			message: "Answer updated successfully.",
		});
	}
	
}
exports.deleteAnswer= async (req,res)=>{
	const { answerId }=req.params;
	const ans=await answerModel.findById(answerId);
	if(ans==null) {
		res.status(400).send({
			success: false,
			message: "Invalid answer id.",
		});
	}
	else {
		const status=await answerModel.deleteOne({_id: answerId}); 
		Question.onAnswerDelete(answerId);
		res.status(200).send({
			success: true,
			message: "Answer deleted successfully.",
		});
	}
}

exports.markAsResolvable = async (answerId)=>{
	const ans=await answerModel.findById(answerId);
	if(ans==null) {
		return false;
	}
	else {
		await answerModel.updateOne({_id: answerId}, {resolvable: true});
		return true;
	}	
}

exports.markAsUnresolvable = async (answerId)=>{
	const ans=await answerModel.findById(answerId);
	if(ans==null) {
		return false;
	}
	else {
		await answerModel.updateOne({_id: answerId}, {resolvable: false});
		return true;
	}
}

exports.countFor = async (questionId)=>{
	const count=await answerModel.countDocuments({questionId});
	return count;
}