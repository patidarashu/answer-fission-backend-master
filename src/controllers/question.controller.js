const questionModel=require('./../models/Question');
const Authentication=require('./authentication.controller');
const Comment=require('./comment.controller');
const Answer=require('./answer.controller');

exports.postQuestion = async (req,res)=>{
	const question=req.body;
	question.postDate=new Date();
	question.userId=req.session.userId;
	const newQuestion=new questionModel(question);
	await newQuestion.save();
	if(newQuestion==null) {
		res.status(400).send({
			success: false,
			message: "Failed to post question."
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Question successfully posted."
		});
	}
	
}

exports.searchForQuestion = async (req,res)=>{
	const {searchString,pageNumber,limit}=req.body;	
	const words=searchString.trim().split(/ +/);
	let regexString=words.join(" | ");
	const totalResults=await questionModel.countDocuments({title: new RegExp(regexString,"i")});
	let totalPages=parseInt(totalResults/limit);
	if(totalResults%limit!==0) ++totalPages;
	const offset=(pageNumber-1)*limit;
	const list=await questionModel.find({title: new RegExp(regexString,"i")}).skip(offset).limit(limit);
	const vList=[];
	for(let i=0;i<list.length;++i)
	{
		const question=list[i];
		totalAnswers=await Answer.countFor(question._id);
		vList.push({...question._doc,totalAnswers});		
	}
	res.json({searchResults: vList,totalPages,totalResults});
	res.end();
}

exports.getQuestion = async (req,res)=>{
	const {questionId}=req.params;
	const question=await questionModel.findById(questionId);
	if(question==null) {
		res.status(400).send({
			success: false,
			message: "Question does not exist, you are trying to fetch.",
		});
	}
	else {
		const username=await Authentication.getUsername(question.userId);
		const answers=await Answer.getAnswers(question._id);
		const comments=await Comment.getComments("question",question._id);
		const vQuestion={...question._doc, username, answers, comments};
		res.status(200).send({
			"success": true,
			"question": vQuestion,
		});
	}
	res.end();
}

exports.updateQuestion = async (req,res)=>{
	const {questionId}=req.params;
	const ques=await questionModel.findById(questionId);
	if(ques==null) {
		res.status(400).send({
			success: false,
			message: "Question does not exist, you are trying to update.",
		});
	}
	else {
		const question=req.body;
		const status=await questionModel.updateOne({_id: questionId}, question);
		res.status(200).send({
			success: true,
			message: "Question updated successfully",
		});
	}
	
}

exports.votePositiveForQuestion = async (req,res)=>{
	const { questionId }=req.params;
	const ques=await questionModel.findOne({"votes.positive": {$in: [req.session.userId]}, _id: questionId});
	if(ques!=null) {
		await questionModel.updateOne({_id: questionId}, {$pull: {"votes.positive": req.session.userId}});
		res.status(200).send({
			success: true,
			message: "Vote revoked.",
		});
		return;
	}
	await questionModel.updateOne({_id: questionId}, {$pull: {"votes.negative": req.session.userId}});
	const question=await questionModel.updateOne({_id: questionId}, {$push: {"votes.positive": req.session.userId}});
	if(question==null) {
		res.status(400).send({
			success: false,
			message: "Unable to vote for question.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Voted successfully.",
		});
	}
}

exports.voteNegativeForQuestion = async (req,res)=>{
	const { questionId }=req.params;
	const ques=await questionModel.findOne({"votes.negative": {$in: [req.session.userId]}, _id: questionId});
	if(ques!=null) {
		await questionModel.updateOne({_id: questionId}, {$pull: {"votes.negative": req.session.userId}});
		res.status(200).send({
			success: true,
			message: "Vote revoked.",
		});
		return;
	}
	await questionModel.updateOne({_id: questionId}, {$pull: {"votes.positive": req.session.userId}});
	const question=await questionModel.updateOne({_id: questionId}, {$push: {"votes.negative": req.session.userId}});
	if(question==null) {
		res.status(400).send({
			success: false,
			message: "Unable to vote for question.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Voted successfully.",
		});
	}
}

exports.openOrCloseQuestion = async (req,res)=>{
	const { questionId }=req.params;
	const ques=await questionModel.findById(questionId);
	if(ques==null) {
		res.status(400).send({
			success: false,
			message: "Invalid Question id.",
		});
	}
	else {
		const questionData=req.body;
		await questionModel.updateOne({_id: questionId}, questionData);
		res.status(200).send({
			success: true,
			message: "Question closed successfully.",
		});
	}	
}

exports.markAsResolved = async (req,res)=>{
	const {questionId, answerId}=req.params;
	const ques=await questionModel.findById(questionId);
	if(ques==null) {
		res.status(400).send({
			success: false,
			message: "Invalid Question id.",
		});
	}
	else {
		if(ques.resolved) {
			await Answer.markAsUnresolvable(ques.resolvedAnswerId);
		}
		const success=await Answer.markAsResolvable(answerId);
		if(!success) {
			res.status(400).send({
				success: false,
				message: "Invalid Answer id.",
			});	
			return;
		}
		await questionModel.updateOne({_id: questionId}, {resolved: true, resolvedAnswerId: answerId});
		res.status(200).send({
			success: true,
			message: "Marked as resolved.",
		});
	}	
}

exports.markAsUnresolved = async (req,res)=>{
	const {questionId, answerId}=req.params;
	const ques=await questionModel.findById(questionId);
	if(ques==null) {
		res.status(400).send({
			success: false,
			message: "Invalid Question id.",
		});
	}
	else {
		const success=await Answer.markAsUnresolvable(answerId);
		if(!success) {
			res.status(400).send({
				success: false,
				message: "Invalid Answer id.",
			});	
			return;
		}
		await questionModel.updateOne({_id: questionId}, {resolved: false, resolvedAnswerId: null});
		res.status(200).send({
			success: true,
			message: "Marked as unresolved.",
		});
	}	
}

exports.onAnswerDelete = async (answerId)=>{
	const question=await questionModel.findOne({resolved: true, resolvedAnswerId: answerId});
	if(question!=null) {
		await questionModel.updateOne({_id: question._id}, {resolved: false, resolvedAnswerId: null});
	}
}
exports.getQuestionsForUser = async (req,res)=>{
	const {userId}=req.params;
	const list=await questionModel.find({userId});
	res.json({questions: list});
	res.end();
}