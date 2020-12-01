var express			 = require('express'),
	multer			 = require('multer'),
	app 			 = express(),
	fs 				 = require('fs'),
{TesseractWorker} 	 = require('tesseract.js'), //npm install tesseract.js@2.0.0-alpha.15
	worker			 = new TesseractWorker(),
	bodyParser 	   	 = require("body-parser"),
	methodOverride   = require("method-override"),
	expressSession   = require('cookie-session'),
	flash			 = require('connect-flash'),
	mongoose		 = require("mongoose"),
	passport		 = require('passport'),
	LocalStrategy	 = require('passport-local'),
	Form 			 = require('./models/form'),
	Data 			 = require('./models/data'),
	User			 = require('./models/user'), 
	UserRoutes		 = require('./routes/users'),
	middleware 		 = require("./middleware"),
	myformRoutes  	 = require('./routes/myform');


app.use(express.static(__dirname + "/public"));//install express-static
mongoose.connect("mongodb+srv://sandhuz:graduation51@cluster0.cbuen.mongodb.net/ocr?retryWrites=true&w=majority", {  //new_ocr  
//mongodb://localhost/new_ocr
	useNewUrlParser: true,
	useUnifiedTopology: true,
  	useCreateIndex: true,
    useFindAndModify: false });
app.use(bodyParser.urlencoded({extended : true})); //yaad kro to use body parser
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
extended: true
})); 
var cur;

//flash
app.use(flash());

//passport configuration
var expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

 const session = expressSession({
   secret: 'gagz di sheli canada chli',
   resave: false,
   saveUninitialized: true,
   cookie: {
	 secureProxy: true,
	 httpOnly: true,
	 domain: 'example.com',
	 expires: expiryDate
   }
 })

 app.use(session)


//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
	res.locals.currentUser = req.user;//we pass current user to everyone
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

//Route Handlers
app.use('/', UserRoutes);
app.use('/myform', myformRoutes);

//////Storage////////
var Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./images");
  	},
 filename: (req, file, callback) => {
    callback(null, file.originalname);
  }
});

var upload = multer({storage: Storage}).single("avatar");
////////////////////


app.get('/home', function(req, res){
  res.render('index');
});

app.get('/', function(req, res){
	res.render('landing');
  });

app.get('/aboutus', function(req, res){
	res.render('aboutus');
  });

//new form
app.get('/ocr', middleware.isLoggedIn, function(req, res){
	
  res.render('form', {currentUser: req.user});
});

//post route to save new form
app.post("/upload", function(req, res){
	upload(req, res, err => {
		fs.readFile(`./images/${req.file.originalname}`, function(err, data){
			if(err){
				req.flash('error', 'Try Again!')
				console.log(err);
			}else {
				worker
					.recognize(data, "eng")
				//, {tessjs_create_pdf: '1'} to make pdf
					.progress(progress => {
						console.log(progress);
				})
					.then(result => {
					// res.redirect("/download");
					// res.send(result.text);
					console.log(result.text);
					// var p = result.text;
					// sort(p);
					var newData = {text : result.text};
					Data.create(newData,function(err, newtext){
						if(err){
						req.flash('error', 'Try Again!')
						console.log(err);
						}else{
							res.render("show", {data: newtext})	
							}	
					})
				})
					.finally(() => worker.terminate());
			}
		})
	})
})

//Sorting goes here
app.get("/sort/:id", middleware.isLoggedIn, function(req, res){
	//find the data with provided id
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	Data.findById(req.params.id).exec(function(err,foundData){//.id can be .anything
		if(err){
			req.flash('error', 'Try Again!')
			console.log(err);
		}else{
			var p = foundData.text;
			// sort(p);
			// p = p.toString();
			// p = p.replace(/[:]+/g, " ")
			// p = p.replace(/[ ]+/g, "_")
			// p = p.replace(/[A-Z]+/g, "$")
			// p = p.replace(/[_]+/g, " ")
			sort(p,author);
			res.redirect('/myform/view');
			req.flash('success', 'Form Creation Successfull!')
			// res.render("sort", {p : p});
		}
	})
});




function sort(p,author){
	var s = p;
	var n = s.length;
	var l = 0; 
	var a1,a2,a3,a4,a5,a6;
	var a,b,c;
	for(var i = 0; i < n; i++) {
		if(s[i]=='$'&&l==0){
			var k = 2;
			a1 = k;
			while(s[k]!='$'){
				k++;
			} a2 = k-1; l++; k=k+2; // k+2 to skip $ and space
		var j = k;
			a3 = k;
			while(s[k]!='$'){
				k++;
			} a4 = k-1; k=k+2;
		j = k;
			a5 = k;
			while(k!=n){ // in end string this way
				k++;
			}
			a6 = k;
		}
	}
	function capitalize_Words(str)
	{
	 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	s = capitalize_Words(s);
	a = s.substring(a1,a2);
	b = s.substring(a3,a4);
	c = s.substring(a5,a6);

	var test = a.split('\n');
	

	console.log(test);
	const newForm = new Form({name : test[0].split(':')[1], rollno : test[1].split(':')[1], dept : test[2].split(':')[1], author : author});

	//create a new Form and save it in DB
	newForm.save();
}

// app.get("/download", function(req, res){
// 	var file = `${__dirname}/tesseract.js-ocr-result.pdf`;
// 	res.download(file);
// })

app.listen(5000, function(){
	console.log("Server ON");
})

