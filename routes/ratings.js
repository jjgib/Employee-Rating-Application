var express = require('express');
var router = express.Router();
const empHelper = require('../helpers/emp-helpers');
const ratingHelper = require('../helpers/rating-helpers');

const verifyLogin = (req,res,next)=>{
    if(req.session.loggedIn){
      next();
    } else {
      res.redirect('/rating/login');
    }
  };
  
/*const verifyLogin2 = (req,res,next)=>{
    if(req.session.loggedIn){
      next();
    } else {
      res.redirect('/rating/login?pg=2');
    }
  };*/

router.get('/rating-form-hr',(req,res)=>{
    res.render('rating-form/rating-form-hr',{layout:'rating-form-layout',title:'Rating form for HR'});
});

router.get('/login',(req,res)=>{
    let pg = req.query.pg;
    /*if(pg == 2){
        res.render('rating-form/login-for-CWF',{layout:'rating-form-layout',title:'Login for Employees'});
    }else {*/
        res.render('rating-form/login',{layout:'rating-form-layout',title:'Login for Employees'});
    /*}*/
    
});
//Login Post method for employees
router.post('/login',(req,res)=>{
    ratingHelper.doLogin(req.body).then((response)=>{
        if(response.status){
            req.session.loggedIn = true;
            req.session.user = response.user;
            //res.render('rating-form/rating-form-employee',{layout:'rating-form-layout',title:'Employees',userData:response.user});
            res.redirect('/rating/dashboard');
        }
        else {
            req.session.logginErr = "Employee ID & date of birth does not match"; 
            res.render('rating-form/login',{layout:'rating-form-layout',title:'Login for Employees',loginErr:req.session.logginErr});
        }
    });
})

router.get('/rating-form-employee',verifyLogin,(req,res)=>{
    let user = {};
    if(req.session.user){
        user =     req.session.user;
    }
    res.render('rating-form/rating-form-employee',{layout:'rating-form-layout',title:'Rating form for Employees', userData:user});
});
router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/rating/login');
  });
  
router.get('/rating-form-coworker',verifyLogin,(req,res)=>{
    let user = {};
    if(req.session.user){
        user = req.session.user;
    }
    res.render('rating-form/rating-form-coworker',{layout:'rating-form-layout',title:'Coworker rating', userData:user});
});
//Login Post method for Coworker rating form
router.post('/rating-form-coworker',(req,res)=>{
    ratingHelper.doLogin(req.body).then((response)=>{
        if(response.status){
            req.session.loggedIn = true;
            req.session.user = response.user;
            res.render('rating-form/rating-form-coworker',{layout:'rating-form-layout',title:'Coworker rating form',userData:response.user});
        }
        else {
            req.session.logginErr = "Employee ID & date of birth does not match";
            res.render('rating-form/login',{layout:'rating-form-layout',title:'Login for Employees',loginErr:req.session.logginErr});
        }
    });
})


router.get('/getEmployee',(req,res)=>{
    var regex = new RegExp(req.query["term"],'i');
    ratingHelper.fetchEmpData(regex).then((response)=>{
        //console.log(response);
        res.send({response});
    }).catch((err)=>{
        res.send(err);
    });
});
router.get('/getCoworkers',(req,res)=>{
    var regex = new RegExp(req.query["term"],'i');
    var userId = req.session.user._id;
    ratingHelper.fetchCoworkerData(regex,userId).then((response)=>{
        //console.log(response);
        res.send({response});
    }).catch((err)=>{
        res.send(err);
    });
})

router.post('/save-hr-rating',(req,res)=>{
    ratingHelper.saveHrFormData(req.body).then((response)=>{
        res.send(response);
    }).catch((err)=>{
        res.send(err);
    });
});

router.post('/save-self-rating', (req,res)=>{
    ratingHelper.saveSelfRating(req.body).then((response)=>{
        res.send(response);
    }).catch((err)=>{
        res.send(err);
    });
});
router.post('/save-coworker-rating', (req,res)=>{
    ratingHelper.saveCoworkerRating(req.body).then((response)=>{
        res.send(response);
    }).catch((err)=>{
        res.send(err);
    });
});

router.get('/dashboard',verifyLogin,(req,res)=>{
    let user = {};
    if(req.session.user){
        user = req.session.user;
    }
    res.render('emp-profile/dashboard',{layout:'emp-profile-layout',title:'Dashboard | Account', userData:user});
});

router.get('/my-self-ratings',verifyLogin,(req,res)=>{
    let user = {};
    if(req.session.user){
        user = req.session.user;
    }
    res.render('emp-profile/selfrating-list',{layout:'emp-profile-layout',title:'My ratings | Account', userData:user});
});
router.get('/create-work-report',verifyLogin,(req,res)=>{
    let user = {};
    if(req.session.user){
        user = req.session.user;
    }
    res.render('emp-profile/add-work-report',{layout:'emp-profile-layout',title:'Work report | Account', userData:user});
});
router.post('/create-work-report',(req,res)=>{
	ratingHelper.saveReport(req.body).then((response)=>{
    console.log(response);
    res.send({status:response.status,message:"Success"});
  }).catch((error)=>{
    res.send({status:error});
  });
});

router.get('/selfRatingList',function(req,res){
    let empId = "";
    if(req.session.user){
        empId = req.session.user._id;
    }
    ratingHelper.getSelfRatingList(empId).then((response)=>{
      res.send(response); 
    });
  });
  router.get('/reportList',function(req,res){
    let empId = "";
    if(req.session.user){
        empId = req.session.user._id;
    }
    ratingHelper.getReportList(empId).then((response)=>{
        res.send(response); 
    });
  });

module.exports = router;
