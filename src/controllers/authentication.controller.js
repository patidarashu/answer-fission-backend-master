const userModel=require('./../models/User');
const bcrypt=require('bcrypt');
const SALT=9;

exports.AuthMiddleware = async (req,res,next)=>{
	if(req.session==null || req.session.userId==null) {
		res.status(401).send({
			success: false,
			message: "Failed to Authenticate."
		});
	}
	else {
		next();
	}
};

exports.login = async (req,res)=>{
	const {username,password}=req.body;
	const existingUser=await userModel.findOne({username});
	if(existingUser==null) {
		res.status(401).send({
			success: false,
			message: "Invalid username."
		});
	}
	else {
		const hashedPassword=existingUser.password;
		if(bcrypt.compareSync(password,hashedPassword)) {
			req.session.userId=existingUser._id;
			res.status(200).send({
				success: true,
				message: "Logged in"
			});
		}
		else {
			res.status(401).send({
				success: false,
				message: "Incorrect password."
			});
		}
	}
	
	res.end();
}

exports.signup = async (req,res)=>{
	const {username,password,email}=req.body;
	const existingUser=await userModel.findOne({username});
	if(existingUser!=null) {
		res.status(400).send({
			success: false,
			message: "Username not available."
		});
	}
	else {
		const hashedPassword=bcrypt.hashSync(password,SALT);
		const newUser=new userModel({
			username,
			password: hashedPassword,
			email
		});
		await newUser.save();
		req.session.userId=newUser._id;
		res.status(200).send({
			success: true,
			message: "Signed up successfully."
		});
	}
	res.end();
}

exports.logout = (req,res)=>{
	if(req.session!=null) {
		req.session.destroy(()=>{
			res.sendStatus(200);
		});
	}
	else {
		res.sendStatus(200);
	}
}

exports.getUser = async (req,res)=>{
	const existingUser=await userModel.findById(req.session.userId);
	if(existingUser==null) {
		res.status(401).send({
			success: false,
			message: "Failed to Authenticate."			
		});
	}
	else {
		res.status(200).send({
			success: true,
			user: existingUser,
			message: "Logged in successfully.",
		});
	}
}

exports.getUsername = async (userId)=>{
	const user=await userModel.findById(userId);
	return user.username;
}

exports.updateUser = async (req,res)=>{
	const userId=req.params.userId;
	const existingUser=await userModel.findById(userId);
	if(existingUser==null) {
		res.status(401).send({
			success: false,
			message: "Failed to Authenticate."			
		});
	}
	else {
		const user=req.body;
		const status=await userModel.updateOne({_id: userId},user);
		res.status(200).send({
			success: true,
			message: "User details updated successfully."			
		});
	}
		
}