var express = require('express');
var router = express.Router();
const adminHelper = require('../helpers/admin-helpers');

const fs = require('fs');
const path = require('path');
/*const puppeteer = require('puppeteer');*/
const handlebars = require('handlebars');

const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn == true){
    next();
  } else {
    res.redirect('/admin/login');
  }
};

router.get('/rating-form-hr',verifyLogin,(req,res)=>{
  let user = req.session.user;
  res.render('rating-form/rating-form-hr',{layout:'rating-form-layout',title:'Rating form for HR',user});
});

router.get('/dashboard',verifyLogin,(req,res)=>{
  let user = req.session.user;
  adminHelper.getCountForDash().then((response)=>{
    res.render("dashboard",{dashboardHeader:true, title:"Dashboard",user, empCount: response.emp, hrRatingCount: response.hrRating});
  });
});
router.get('/login',(req,res,next)=>{
  if(req.session.loggedIn){
    res.redirect('/admin/dashboard');
  }
  else {
    res.render('login',{"loginErr":req.session.loginErr, title:"Login"});
    req.session.loginErr = false;
  }
});
router.post('/login',(req,res)=>{
    adminHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/admin/dashboard');
    }
    else {
      req.session.loginErr = "Invalid username or password";
      res.render("login",{"loginErr":req.session.loginErr, title:"Login"});
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/admin/login');
});

router.get('/signup',(req,res,next)=>{
  res.render('signup');
});

router.post('/signup',(req,res,next)=>{
    adminHelper.doSignup(req.body).then((response)=>{
    if(response.Email){ //response.insertedId
      res.render("signup",{loginStatus:true});
    }
  });
});

router.get('/hrRatingList',function(req,res){
    adminHelper.getHrRatingList().then((response)=>{
      res.send(response);
    });
  });
  
  router.get('/hr-rating-list',verifyLogin,function(req,res){
    let user = req.session.user;
    res.render('rating-list/hr',{ dashboardHeader:true, title:"HR rating list", user});
  });

  router.get('/selfRatingList',function(req,res){
    adminHelper.getSelfRatingList().then((response)=>{
      res.send(response);
    });
  });
  
  router.get('/self-rating-list',verifyLogin,function(req,res){
    let user = req.session.user;
    res.render('rating-list/emp-self',{ dashboardHeader:true,title:"Employee self rating list", user});
  });

  router.get('/coworker-rating-list',verifyLogin,function(req,res){
    let user = req.session.user;
    res.render('rating-list/coworker',{ dashboardHeader:true,title:"Coworker rating list", user});
  });
  router.get('/coworkerRatingList',function(req,res){
    adminHelper.getCoworkerRatingList().then((response)=>{
      res.send(response);
    });
  });

  router.get('/work-report',verifyLogin,function(req,res){
    let user = req.session.user;
    res.render('work-report/work-report-list',{ dashboardHeader:true, title:"Work report list", user});
  });
  router.get('/workReportList',function(req,res){
    adminHelper.getWorkReportList().then((response)=>{
      res.send(response);
    });
  });
  router.get('/workreport/:id',verifyLogin, function(req,res){
    let Id = req.params.id;
    let user = req.session.user;
    adminHelper.getReportDetail(Id).then((response)=>{
      let rData = response;
      console.log(rData);
      res.render('work-report/detail',{ dashboardHeader:true, title:"Work report detail", user, rData});
    });
  
  });
  //updateReportStatus
  router.post('/updateReportStatus',(req,res)=>{
    adminHelper.updateStatus(req.body).then((response)=>{
      res.send(response);
    }).catch((error)=>{
      res.send({status:0, message:error});
    });
  });


  router.get('/rating-period',verifyLogin, function(req, res, next) {
    let user = req.session.user;
    res.render('settings/rating-period',{dashboardHeader:true, title:"Rating period",user});
});

router.post('/add-rating-period',(req,res)=>{
  /*adminHelper.checkDatePeriod(req.body).then((response)=>{
    if(response > 0){
      res.send({status:2,message:"Data already exist"});
    }
    else {*/
      adminHelper.saveRatingPeriod(req.body).then((data)=>{
        console.log(data);
        res.send({status:data.status,message:data.msg});
      }).catch((error)=>{
        res.send({status:error});
      });
   /* }
  });*/
	
});
router.post('/getRatingPeriod',(req,res)=>{
  adminHelper.getRatingPeriod(req.body).then((response)=>{
    res.send({status:true, dates:response});
  }).catch((error)=>{
    res.send({status:error});
  });
});

router.get('/getPeriodList',function(req,res){
  adminHelper.getAllPeriodList().then((response)=>{
    res.send(response);
  });
});

router.post('/deletePeriod',(req,res)=>{
  let deleteId = req.body.deleteId;
  adminHelper.deletePeriod(deleteId).then((response)=>{
    if(response){
      res.send({status:true,message:response});
    } 
  }).catch((error)=>{
    res.send({status:false,message:error});
  });
});

router.get('/act-subscription',verifyLogin, function(req, res, next){
  let user = req.session.user;
  adminHelper.getSubscribeStatus().then((response)=>{
    let subscribeData = response;
    res.render('settings/subscription',{dashboardHeader:true, title:"Subcription",user, subscribeData, optionsRadioA:subscribeData[0].status });
  })
  
});
router.post('/subscribe',(req,res)=>{
  adminHelper.subscribe(req.body).then((response)=>{
    res.send(response);
  });
})

  

/*router.get('/add-test-details',(req,res)=>{
  let user = req.session.user;
  res.render('add-test',{dashboardHeader:true,user});
});

router.post('/add-test-details',(req,res)=>{
  adminHelper.saveTestData(req.body).then((response)=>{
    res.send({status:response.status});
  }).catch((error)=>{
    res.send({status:error});
  });
});

router.get('/test-list',(req,res)=>{
  let user = req.session.user;
  res.render('test-list',{dashboardHeader:true,user});
})

router.get('/getTestList',(req,res)=>{
  adminHelper.getAllTestDetails().then((response)=>{
    res.send(response);
  });
  
});

router.get('/test/edit/:id',(req,res)=>{
  let testId = req.params.id;
  let user = req.session.user;
  adminHelper.getTestDetail(testId).then((response)=>{
    res.render("add-test",{ dashboardHeader:true, user, testData : response});
  });
});

router.post('/test/delete',(req,res)=>{
  let deleteId = req.body.deleteId;
  adminHelper.deleteTest(deleteId).then((response)=>{
    res.send({status:true});
  });
});*/

router.get('/test/download/:id',(req,res)=>{
  let testId = req.params.id;

  adminHelper.createReport(testId).then(async(data)=>{
    var templateHtml = fs.readFileSync(path.join(process.cwd(), '/views/reports/report-en.html'), 'utf8');
	var template = handlebars.compile(templateHtml);
	var html = template(data);
    
	var milis = new Date();
	milis = milis.getTime();

	var pdfPath = path.join(process.cwd()+'/public/pdf', `${data[0].name}-${milis}.pdf`);

	var options = {
		width: '1230px',
		/*headerTemplate: "<p></p>",
		footerTemplate: "<p></p>",*/
		displayHeaderFooter: false,
		/*margin: {
			top: "10px",
			bottom: "30px"
		},*/
		printBackground: true,
		path: pdfPath
	}

	/*const browser = await puppeteer.launch({
		args: ['--no-sandbox'],
		headless: true
	});

	var page = await browser.newPage();
	
	await page.goto(`data:text/html;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
	});

	await page.pdf(options);
	await browser.close();*/
  });
});




module.exports = router;
