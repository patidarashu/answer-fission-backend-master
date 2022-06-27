const formidable=require('formidable');
const fs=require('fs');


const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
};

exports.getImage=async (req,res)=>{
	const fileName=req.params.fileName;
	const uploadedFor=req.params.uploadedFor+"/";
	const filePath='./images/'+uploadedFor+fileName;
	const stream=fs.createReadStream(filePath);
	const mimeType=mime[fileName.slice(fileName.lastIndexOf('.')+1)];
	stream.on("open",()=>{
		res.writeHead(200,{
			"content-type": mimeType,
		});
		stream.pipe(res);
	});
	stream.on("error",()=>{
		res.status(404).send({
			success: false,
			message: "Not found",
		});
	});
}
exports.imageUpload=async (req,res)=>{
	const uploadedFor=req.params.uploadedFor+"/";
	const form = new formidable.IncomingForm();
	form.parse(req,(err,fields,files)=>{
		const oldPath=files.upload.path;
		const fileExtension=files.upload.name.slice(files.upload.name.lastIndexOf('.'));
		const newName="AnswerFission"+files.upload.path.slice(files.upload.path.lastIndexOf('\\')+1)+fileExtension;
		const newPath="./images/"+uploadedFor+newName;
		fs.rename(oldPath,newPath,(err)=>{
			if(err) {
				console.log(err);
				res.status(400).send({
					uploaded: 0,
					filename: "",
					url: "",
				});
			}
			else res.status(200).send({
				uploaded: 1,
				filename: files.upload.name,
				url: "http://localhost:8888/getImage/"+uploadedFor+newName,
			});
		});
		
	});
}