const articleModel=require('./../models/Article');
const Authentication=require('./authentication.controller');
const Comment=require('./comment.controller');

exports.postArticle = async (req,res)=>{
	const article=req.body;
	article.postDate=new Date();
	article.userId=req.session.userId;
	const newArticle=new articleModel(article);
	await newArticle.save();
	if(newArticle==null) {
		res.status(400).send({
			success: false,
			message: "Failed to post article."
		});	
	}
	else {
		res.status(200).send({
			success: true,
			message: "Article successfully posted."
		});		
	}
}

exports.searchForArticles = async (req,res)=>{
	const {searchString,pageNumber,limit}=req.body;	
	const words=searchString.trim().split(/ +/);
	let regexString=words.join(" | ");
	const totalResults=await articleModel.countDocuments({title: new RegExp(regexString,"i"), isDeleted: false});
	let totalPages=parseInt(totalResults/limit);
	if(totalResults%limit!==0) ++totalPages;
	const offset=(pageNumber-1)*limit;
	const list=await articleModel.find({title: new RegExp(regexString,"i"), isDeleted: false}).skip(offset).limit(limit);
	const vList=[];
	for(let i=0;i<list.length;++i) {
		const article=list[i];
		const username=await Authentication.getUsername(article.userId);
		vList.push({...article._doc,username});
	}
	res.json({searchResults: vList,totalPages,totalResults});
	res.end();
}

exports.getArticle = async (req,res)=>{
	const {articleId}=req.params;
	const article=await articleModel.findById(articleId);
	if(article==null) {
		res.status(400).send({
			success: false,
			message: "Article does not exist, you are trying to fetch.",
		});
	}
	else {
		const username=await Authentication.getUsername(article.userId);
		const comments=await Comment.getComments("article",article._id);
		const vArticle={...article._doc, username, comments};
		res.status(200).send({
			"success": true,
			"article": vArticle,
		});
	}
	res.end();
}

exports.updateArticle = async (req,res)=>{
	const {articleId}=req.params;
	const ar=await articleModel.findById(articleId);
	if(ar==null) {
		res.status(400).send({
			success: false,
			message: "Article does not exist, you are trying to update.",
		});
	}
	else {
		const article=req.body;
		const status=await articleModel.updateOne({_id: articleId},article);
		res.status(200).send({
			"success": true,
			"message": "Article updated successfully",
		});
	}
	res.end();
	
}

exports.softDeleteArticle = async (req,res)=>{
	const {articleId}=req.params;
	const article=await articleModel.findById(articleId);
	if(article==null) {
		res.status(400).send({
			success: false,
			message: "Article does not exist, you are trying to delete.",
		});
	}
	else {
		await articleModel.updateOne({_id: articleId}, {isDeleted: true});
		res.status(200).send({
			success: true,
			message: "Article deleted and saved privately.",
		});
	}	
}
exports.undeleteArticle = async (req,res)=>{
	const {articleId}=req.params;
	const article=await articleModel.findById(articleId);
	if(article==null) {
		res.status(400).send({
			success: false,
			message: "Article does not exist, you are trying to undelete.",
		});
	}
	else {
		await articleModel.updateOne({_id: articleId}, {isDeleted: false});
		res.status(200).send({
			success: true,
			message: "Article undeleted and available publicly.",
		});
	}		
}

exports.votePositiveForArticle = async (req,res)=>{
	const { articleId }=req.params;
	const ar=await articleModel.findOne({"votes.positive": {$in: [req.session.userId]}, _id: articleId});
	if(ar!=null) {
		await articleModel.updateOne({_id: articleId}, {$pull: {"votes.positive": req.session.userId}});
		res.status(200).send({
			success: true,
			message: "Vote revoked.",
		});
		return;
	}
	await articleModel.updateOne({_id: articleId}, {$pull: {"votes.negative": req.session.userId}});
	const article=await articleModel.updateOne({_id: articleId}, {$push: {"votes.positive": req.session.userId}});
	if(article==null) {
		res.status(400).send({
			success: false,
			message: "Unable to vote for article.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Voted successfully.",
		});
	}
}

exports.voteNegativeForArticle = async (req,res)=>{
	const { articleId }=req.params;
	const ar=await articleModel.findOne({"votes.negative": {$in: [req.session.userId]}, _id: articleId});
	if(ar!=null) {
		await articleModel.updateOne({_id: articleId}, {$pull: {"votes.negative": req.session.userId}});
		res.status(200).send({
			success: true,
			message: "Vote revoked.",
		});
		return;
	}
	await articleModel.updateOne({_id: articleId}, {$pull: {"votes.positive": req.session.userId}});
	const article=await articleModel.updateOne({_id: articleId}, {$push: {"votes.negative": req.session.userId}});
	if(article==null) {
		res.status(400).send({
			success: false,
			message: "Unable to vote for article.",
		});
	}
	else {
		res.status(200).send({
			success: true,
			message: "Voted successfully.",
		});
	}
}

exports.getSoftDeletedArticles = async (req,res)=>{
	const totalResults=await articleModel.countDocuments({isDeleted: true, userId: req.session.userId});
	const list=await articleModel.find({isDeleted: true, userId: req.session.userId});
	const vList=[];
	for(let i=0;i<list.length;++i) {
		const article=list[i];
		const username=await Authentication.getUsername(article.userId);
		vList.push({...article._doc,username});
	}
	res.json({deletedArticles: vList,totalResults});
	res.end();	
}
exports.hardDeleteArticle = async (req,res)=>{
	const {articleId}=req.params;
	const article=await articleModel.findById(articleId);
	if(article==null) {
		res.status(400).send({
			success: false,
			message: "Article does not exist, you are trying to delete.",
		});
	}
	else {
		await articleModel.deleteOne({_id: articleId});
		res.status(200).send({
			success: true,
			message: "Article deleted successfully.",
		});
	}
}

exports.getArticlesForUser = async (req,res)=>{
	const {userId}=req.params;
	const list=await articleModel.find({userId, isDeleted: false});
	res.json({articles: list});
	res.end();
}