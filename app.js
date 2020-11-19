var express			 = require('express'),
	multer			 = require('multer'),
	app 			 = express(),
	fs 				 = require('fs'),
{TesseractWorker} 	 = require('tesseract.js'), //npm install tesseract.js@2.0.0-alpha.15
	worker			 = new TesseractWorker(),
	bodyParser 	   	 = require("body-parser"),
	methodOverride   = require("method-override"),
	session			 = require("express-session"),
	MemoryStore      = require('memorystore')(session),
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
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
	resave: false,
	saveUninitialized: false,
    secret: 'gagz di sheli canada chli'
}))
// app.use(require("express-session")({
// 	secret: "Voldmort is female",
// 	resave: false,
// 	saveUninitialized: false
// }));

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//use local strategy on userschema to authenticate

passport.serializeUser(User.serializeUser());
//store user in session
passport.deserializeUser(User.deserializeUser());
//throw out user when out of session (unstore user)

// app.get('/fakeUser', async (req,res) => {
// 	const user = new User({email: 'san@gmail.com', username: 'sandhu'});
// 	const newUser = await User.register(user, '123')
// 	res.send(newUser);
// })
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


//flash
// app.use(flash());
// //session
// const sessionOptions = { secret: 'gagan de sheli canada gai!', resave: false, saveUninitialized: false }

// app.use(session(sessionOptions));

// app.get('/viewcount', (req,res) => {
// 	if (req.session.count) {
// 		req.session.count += 1;
// 	} else {
// 		req.session.count = 1;
// 	}
// 	res.send(`You have viewed the page ${req.session.count} times`)
// })

// app.get('/reg', (req, res)=> {
// 	const { username = 'Sandhu' } = req.query;
// 	req.session.username = username;  
// 	req.flash('success', 'Successfull');
// 	res.redirect('/greet');
// })
// app.get('/greet', (req, res) => {
// 	const { username } = req.session;
// 	res.send(`Welcome Back, ${username} ${req.flash('success')}`);
// 	//refresh page flash msh will dissappear
// })

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

// const userSchema = mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     email: {
//         type: String,
//         required: true,

//     },
//     phone: {
//         type: Number,
//         required: true
//     },
//     password: {
//         type: String,
//         required: true
//     }
// })
// const User = mongoose.model('user', userSchema)

// app.post('/g_register',async function(req,res){
// 	let name = req.body.username
// 	let password = req.body.password
// 	let email = req.body.email
// 	let phone = req.body.phone

// 	let newuser = new User({
// 		name,
// 		email,
// 		phone,
// 		password
// 	  })
	
// 	  await newuser.save()
// 	  cur = name
// 	  res.render('form',{username:cur})
// })

// app.get('/register',function(req,res){
// 	res.render('signup')
// })


// app.post('/g_login',async function(req,res){
// 	try {
// 		let name = req.body.username
// 		let password = req.body.password
		
// 		const user = await User.find({name:name});
		
// 		if(user[0].password==password){
// 			cur = name
// 			res.render('form',{username:name})
// 		}
// 		else{
// 			res.send("Wrong password try again...")
// 		}
// 	} catch (error) {
// 		res.send("went wrong...")
// 	}
// })

// app.post('/g_logout',async function(req,res){
// 	try {
// 		cur = '';
// 		res.render("index")
// 	} catch (error) {
		
// 	}
// })