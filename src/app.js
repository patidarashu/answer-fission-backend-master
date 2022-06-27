const express=require('express');
const bodyParser=require('body-parser');


const cors=require('cors');
const session=require('express-session');

const app=express();
const session_secret="SOMEUUIDWILLBEUSEDHERE";

const Authentication=require('./controllers/authentication.controller');
const AuthMiddleware=Authentication.AuthMiddleware;
const Question=require('./controllers/question.controller');
const Comment=require('./controllers/comment.controller');
const Answer=require('./controllers/answer.controller');
const ImageHandler=require('./controllers/imageHandler.controller');
const Article=require('./controllers/article.controller');

// required application-level middlewares
app.use(express.urlencoded());
app.use(express.json());
app.use(cors({
	credentials: true,
	origin: "http://localhost:3000"
}));
app.use(session({
	secret: session_secret,
	cookie: {maxAge: 15*24*60*60*1000} 
	// session age: 15 days
}));

// leaving body parser middlewares for now

// Routes

app.post("/login",Authentication.login);

app.post("/signup",Authentication.signup);

app.get("/getUser",AuthMiddleware,Authentication.getUser);

app.get("/logout",Authentication.logout);

app.put("/updateUser/:userId", AuthMiddleware, Authentication.updateUser);


app.post("/postQuestion",AuthMiddleware,Question.postQuestion);

app.post("/searchForQuestion",Question.searchForQuestion);

app.get("/getQuestion/:questionId", Question.getQuestion);

app.put("/updateQuestion/:questionId", AuthMiddleware, Question.updateQuestion);

app.put("/votePositiveForQuestion/:questionId", AuthMiddleware, Question.votePositiveForQuestion);

app.put("/voteNegativeForQuestion/:questionId", AuthMiddleware, Question.voteNegativeForQuestion);

app.put("/openOrCloseQuestion/:questionId", AuthMiddleware, Question.openOrCloseQuestion);

app.put("/markAsResolved/:questionId/:answerId", AuthMiddleware, Question.markAsResolved);

app.put("/markAsUnresolved/:questionId/:answerId", AuthMiddleware, Question.markAsUnresolved);

app.get("/getQuestions/:userId",Question.getQuestionsForUser);



app.post("/postAnswer", AuthMiddleware, Answer.postAnswer);

app.put("/updateAnswer/:answerId", AuthMiddleware, Answer.updateAnswer);

app.put("/votePositiveForAnswer/:answerId",AuthMiddleware,Answer.votePositiveForAnswer);

app.put("/voteNegativeForAnswer/:answerId",AuthMiddleware,Answer.voteNegativeForAnswer);

app.delete("/deleteAnswer/:answerId", AuthMiddleware, Answer.deleteAnswer);


app.post("/postArticle", AuthMiddleware, Article.postArticle);

app.post("/searchForArticles", Article.searchForArticles);

app.get("/getArticle/:articleId", Article.getArticle);

app.put("/updateArticle/:articleId", AuthMiddleware, Article.updateArticle);

app.put("/votePositiveForArticle/:articleId", AuthMiddleware, Article.votePositiveForArticle);

app.put("/voteNegativeForArticle/:articleId", AuthMiddleware, Article.voteNegativeForArticle);

app.delete("/softDeleteArticle/:articleId", AuthMiddleware, Article.softDeleteArticle);

app.put("/undeleteArticle/:articleId", AuthMiddleware, Article.undeleteArticle);

app.get("/getSoftDeletedArticles", AuthMiddleware, Article.getSoftDeletedArticles);

app.delete("/hardDeleteArticle/:articleId", AuthMiddleware, Article.hardDeleteArticle);

app.get("/getArticles/:userId", Article.getArticlesForUser);


app.post("/postComment",AuthMiddleware, Comment.postComment);

app.delete("/deleteComment/:commentId",AuthMiddleware, Comment.deleteComment);

app.put("/updateComment/:commentId", AuthMiddleware, Comment.updateComment);


app.post("/imageUpload/:uploadedFor",ImageHandler.imageUpload);

app.get("/getImage/:uploadedFor/:fileName",ImageHandler.getImage);


module.exports=app;