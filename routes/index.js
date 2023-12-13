var express = require('express');
var router = express.Router();
//const indexHelper = require('../helpers/index-helpers');

const fs = require('fs');
const path = require('path');
/*const puppeteer = require('puppeteer');*/
const handlebars = require('handlebars');

const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next();
  } else {
    res.redirect('/login');
  }
};

router.get('/', function(req, res) {
  res.redirect('/rating/login');
});
router.get('/admin', function(req, res) {
  //res.render('index', { title: 'Express' });
  res.redirect('/admin/login');
});

/*router.get('/dashboard',verifyLogin,(req,res)=>{
  let user = req.session.user;
  res.render("dashboard",{dashboardHeader:true, title:"Dashboard",user});
});
router.get('/login',(req,res,next)=>{
  if(req.session.loggedIn){
    res.redirect('/dashboard');
  }
  else {
    res.render('login',{"loginErr":req.session.loginErr, title:"Login"});
    req.session.loginErr = false;
  }
});
router.post('/login',(req,res)=>{
  indexHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/dashboard');
    }
    else {
      req.session.loginErr = "Invalid username or password";
      res.render("login",{"loginErr":req.session.loginErr, title:"Login"});
    }
  });
});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/login');
});

router.get('/signup',(req,res,next)=>{
  res.render('signup');
});

router.post('/signup',(req,res,next)=>{
  indexHelper.doSignup(req.body).then((response)=>{
    if(response.insertedId){
      res.render("signup");
    }
  });
});

router.get('/add-test-details',(req,res)=>{
  let user = req.session.user;
  res.render('add-test',{dashboardHeader:true,user});
});

router.post('/add-test-details',(req,res)=>{
  indexHelper.saveTestData(req.body).then((response)=>{
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
  indexHelper.getAllTestDetails().then((response)=>{
    res.send(response);
  });
  
});

router.get('/test/edit/:id',(req,res)=>{
  let testId = req.params.id;
  let user = req.session.user;
  indexHelper.getTestDetail(testId).then((response)=>{
    res.render("add-test",{ dashboardHeader:true, user, testData : response});
  });
});

router.post('/test/delete',(req,res)=>{
  let deleteId = req.body.deleteId;
  indexHelper.deleteTest(deleteId).then((response)=>{
    res.send({status:true});
  });
});*/




module.exports = router;
