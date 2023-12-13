var express = require('express');
var router = express.Router();
const empHelper = require('../helpers/emp-helpers');
const premiumHelper = require('../helpers/premium-helpers');

const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next();
  } else {
    res.redirect('/admin/login');
  }
};

router.get('/add-employee',verifyLogin, function(req, res, next) {
    let user = req.session.user;
    res.render('employee/add-employee',{dashboardHeader:true, title:"Add Employee",user});
});

router.post('/add-employee',(req,res)=>{
	empHelper.saveEmpData(req.body).then((response)=>{
    console.log(response);
    res.send({status:response.status,message:"Success"});
  }).catch((error)=>{
    res.send({status:error});
  });
});

router.get('/employee-list',verifyLogin, function(req, res, next) {
  let user = req.session.user;
  res.render('employee/employee-list',{dashboardHeader:true, title:"Employee List",user});
});
//for Free version
router.get('/ratings/:id',verifyLogin, function(req, res) {
  let empId = req.params.id;
  let user = req.session.user;
  empHelper.getEmpDetail(empId).then((response)=>{
      let empData = response;
      res.render('employee/rating-info',{dashboardHeader:true, layout:'rating-info-layout', title:"Rating Information",user, empData});
  });
  
});

//for Premium version
router.get('/ratings-premium/:id',verifyLogin, function(req,res){
  let empId = req.params.id;
  let user = req.session.user;
  let empData = "";
  empHelper.getEmpDetail(empId).then((response)=>{
    empData = response;
  });
  premiumHelper.getAllDateSlots().then((response)=>{
      let allDateSlots = response;
      res.render('employee/rating-info-premium',{dashboardHeader:true,layout:'rating-info-layout-premium',title:'Compare Ratings',user, empData, allDateSlots});
  });
});

router.post('/ratings-premium/getDateSlots2',function(req,res){
  if(req.body.date1_id != ""){
    premiumHelper.getAllDateSlots2(req.body.date1_id).then((response)=>{
      
      res.send(response);
    });
  }
});
router.post('/ratings-premium/getRatingData',function(req,res){
  if(req.body.data1_id != ""){
    premiumHelper.getHRratingData(req.body).then((response)=>{
      //console.log(response);
      res.send(response);
    });
    /*premiumHelper.getSelfRatingData(req.body).then((response)=>{
      res.send(response);
    });*/
  }
});


router.get('/getEmpList',function(req,res){
  empHelper.getAllEmpList().then((response)=>{
    res.send(response);
  });
});

router.get('/edit/:id',verifyLogin,function(req,res){
  let empId = req.params.id;
  let user = req.session.user;
  empHelper.getEmpDetail(empId).then((response)=>{
    var empData = response;
    console.log(empData);
    res.render('employee/add-employee',{ dashboardHeader:true, user, empData});
    //res.send(response);
  });
});

router.post('/delete',(req,res)=>{
  let deleteId = req.body.deleteId;
  empHelper.deleteEmp(deleteId).then((response)=>{
    if(response){
      res.send({status:true,message:response});
    } 
  }).catch((error)=>{
    res.send({status:false,message:error});
  });
});
router.post('/details',(req,res)=>{
  let empId = req.body.empId;
  empHelper.getEmployee(empId).then((response)=>{
    if(response){
      res.send({status:true, employee:response});
    } 
  })
});

router.post('/rating-info',function(req,res){
  let empId = req.body.ID;
  empHelper.getRatingInfo(empId).then((response)=>{
    res.send(response);
  });
});

//Rating list table
/*router.get('/hrRatingList',function(req,res){
  empHelper.getHrRatingList().then((response)=>{
    res.send(response);
  });
});

router.get('/hr-rating-list',verifyLogin,function(req,res){
  let user = req.session.user;
  res.render('rating-list/hr',{ dashboardHeader:true, title:"HR rating list", user});
});*/

/*router.get('/selfRatingList',function(req,res){
  empHelper.getSelfRatingList().then((response)=>{
    res.send(response);
  });
});

router.get('/self-rating-list',verifyLogin,function(req,res){
  let user = req.session.user;
  res.render('rating-list/emp-self',{ dashboardHeader:true,title:"Employee self rating list", user});
});*/



/*router.get('/coworker-rating-list',verifyLogin,function(req,res){
  let user = req.session.user;
  res.render('rating-list/coworker',{ dashboardHeader:true,title:"Coworker rating list", user});
});
router.get('/coworkerRatingList',function(req,res){
  empHelper.getCoworkerRatingList().then((response)=>{
    res.send(response);
  });
});*/
module.exports = router;
