const commentModel=require('./../models/Comment');
const Authentication=require('./authentication.controller');

exports.postComment = async (req,res)=>{
	const comment=req.body;
	comment.postDate=new Date();
	comment.userId=req.session.userId;
	const newComment=new commentModel(comment);
	await newComment.save();
	if(newComment==null) {
		res.status(400).send({
			success: false,
			message: "Failed to post comment.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Comment successfully posted.",
		});
	}
}

exports.deleteComment = async (req,res)=>{
	const {commentId}=req.params;
	await commentModel.deleteMany({parentId: commentId});
	await commentModel.deleteOne({_id: commentId});
	res.status(200).send({
		success: true,
		message: "Comment deleted successfully.",
	});
	
}

exports.getComments = async (parentType,parentId)=>{
	const comments=await commentModel.find({parentType, parentId});
	const vComments=[];
	for(let i=0;i<comments.length;++i) {
		const comment=comments[i];
		const username=await Authentication.getUsername(comment.userId);
		const subComments=await commentModel.find({parentType: "comment", parentId: comment._id});
		const vSubComments=[];
		for(let j=0;j<subComments.length;++j) {
			const subComment=subComments[j];
			const username2=await Authentication.getUsername(subComment.userId);
			vSubComments.push({...subComment._doc,username: username2});
		}
		const newComment={
			...comment._doc,
			subComments: vSubComments,
			username,
		};
		vComments.push(newComment);
	}
	return [...vComments];
}

exports.updateComment = async (req,res)=>{
	const commentId=req.params.commentId;
	const cm=await commentModel.findById(commentId);
	if(cm==null) {
		res.status(400).send({
			success: false,
			message: "Invalid comment id.",
		});
	}
	else {
		const comment=req.body;
		const status=await commentModel.updateOne({_id: commentId},comment);
		res.status(200).send({
			success: true,
			message: "Comment updated successfully",
		});		
	}
}