var db = require('../config/connection');
var collection = require('../config/collections');
/*const bcrypt = require('bcrypt');*/
const bcrypt = require('bcryptjs');
var object_id = require('mongodb').ObjectId;
var moment  = require('moment');

var User = require('../models/user.model');
var Employees = require('../models/employees.model');
var hrRating = require('../models/hrRating.model');
var empSelfRatings = require('../models/empselfratings.model');
var coworkerRating = require('../models/coworkerRatings.model');
var Ratingperiods = require('../models/ratingperiods.model');
var Subscribe = require('../models/subscribe.model');
var Workreports = require('../models/workReports.model');

module.exports = {

    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password = await bcrypt.hash(userData.Password,10);
            /*db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data);
            });*/
            let user1 = new User(userData);
            user1.save((err,data)=>{
                if(err) return console.log(err);
                resolve(data);
            });
        });
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false;
            let response = {};
            //let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email});
            User.findOne({Email:userData.Email}, function(err, user){
                if(err){
                    console.log("Login failed");
                    resolve({status : false});
                }
                else{
                    if(user){
                        bcrypt.compare(userData.Password,user.Password).then((status)=>{
                            if(status){
                                console.log("Login success");
                                response.user = user;
                                response.status = true;
                                resolve(response);
                            }
                            else {
                                console.log("Login failed");
                                resolve({status : false});
                            }
                        });
                    } else {
                        console.log("Login failed");
                        resolve({status : false});
                    }
                    
                }
                
            });
            
            /*if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("Login success");
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }
                    else {
                        console.log("Login failed");
                        resolve({status : false});
                    }
                })
            }
            else {
                console.log("Login failed");
                resolve({status : false});
            }*/
        });
    },
    getWorkReportList:()=>{
        return new Promise(async(resolve,reject)=>{
            let reportList = await Workreports.aggregate([
                {
                    $lookup:{
                        from:'employees',
                        localField:'employeeId',
                        foreignField:'_id',
                        as:'emp_data'
                    }
                },
                {
                    $project: {"emp_data.firstName":1, "emp_data.lastName": 1, title: 1, is_verified:1, createdDateTime:1, createdDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
                },
                {
                    $sort: {createdDateTime: -1}
                }
            ]);
            if(reportList){
                let reportList2 = reportList.map(function(element){
                    let status_icon = "";
                    
                    if(element.is_verified == "not verified"){
                        status_icon = '<i title="Not reviewed" class="v-icon blue fas fa-check-circle"></i>';
                    } else {
                        status_icon = '<i title="Reviewed" class="v-icon green fas fa-check-circle"></i>';
                    }
                    let quick_view = '<a class="btn btn-sm btn-outline-primary" href="/admin/workreport/'+element._id+'" title="View Report"><i class="far fa-file-alt mr-1"></i>&nbsp;View Report</a>';
                    return {
                        name: element.emp_data[0].firstName+"&nbsp"+element.emp_data[0].lastName,
                        title: element.title,
                        submitDate: element.createdDate,
                        status: status_icon,
                        action: quick_view
                    }
                });
                resolve(reportList2);
            }
            else {
                resolve({status:"Error in fetching data"});
            }
            
        });
    },
    getReportDetail:(Id)=>{
        return new Promise(async(resolve,reject)=>{
            let repData = await Workreports.aggregate([
                { $match:{_id : object_id(Id)}  },
                {
                    $lookup:{
                        from:'employees',
                        localField:'employeeId',
                        foreignField:'_id',
                        as:'emp_data'
                    }
                },
                {
                    $project: {"emp_data.firstName":1, "emp_data.lastName": 1, title: 1, description:1, is_verified:1, createdDateTime:1, createdDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
                },
                {
                    $sort: {createdDateTime: -1}
                }
            ]);
            if(repData){
                let repData2 = repData.map(function(element){
                    let status = "";
                    if(element.is_verified == "verified"){
                        status = "checked";
                    }
                    return{
                        _id: element._id,
                        name: element.emp_data[0].firstName+" "+element.emp_data[0].lastName,
                        title: element.title,
                        description: element.description,
                        createdDate: element.createdDate,
                        status: status
                    }
                });
                resolve(repData2);
            }
        });
    },
    updateStatus:(sData)=>{
        return new Promise(async(resolve,reject)=>{
            let message_info ="Review status changed to not verified.";
            let updated = await Workreports.updateOne({_id:object_id(sData.id)}, {
                $set: {
                    is_verified: sData.status
                }
            });
            if(updated){
                if(sData.status == "verified"){
                    message_info = "Verified";
                }
                resolve({status:1, message: message_info});
            }
            else {
                resolve({status:0, message: "No updated in database"});
            }
        });
    },
    getHrRatingList:()=>{
        return new Promise(async(resolve,reject)=>{
            let ratingList = await hrRating.aggregate([
                {
                    $lookup:{
                        from:'employees',
                        localField:'employeeId',
                        foreignField:'_id',
                        as:'emp_data'
                    }
                },
                {
                    $project: {"emp_data.firstName":1, "emp_data.lastName": 1, total_rate: 1, createdDateTime:1, createdDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
                },
                {
                    $sort: {createdDateTime: -1}
                }
            ]);
            if(ratingList){
                resolve(ratingList);
            }
            else {
                resolve({status:"Error in fetching data"});
            }
            
        });
    },
    getSelfRatingList:()=>{
        return new Promise(async(resolve,reject)=>{
            let ratingList = await empSelfRatings.aggregate([
                {
                    $lookup:{
                        from:'employees',
                        localField:'employeeId',
                        foreignField:'_id',
                        as:'emp_data'
                    }
                },
                {
                    $project: {"emp_data.firstName":1, "emp_data.lastName": 1, total_rate: 1, createdDateTime:1, createdDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
                },
                {
                    $sort: {createdDateTime: -1}
                }
            ]);
            if(ratingList){
                resolve(ratingList);
            }
            else {
                resolve({status:"Error in fetching data"});
            }
            
        });
    },
    getCoworkerRatingList:()=>{
        return new Promise(async(resolve,reject)=>{
            let ratingList = await coworkerRating.aggregate([
                {
                    $lookup:{
                        from:'employees',
                        localField:'coworkerId',
                        foreignField:'_id',
                        as:'emp_data'
                    }
                },
                {
                    $project: {"emp_data.firstName":1, "emp_data.lastName": 1, total_rate: 1, createdDateTime:1, createdDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
                },
                {
                    $sort: {createdDateTime: -1}
                }
            ]);
            if(ratingList){
                resolve(ratingList);
            }
            else {
                resolve({status:"Error in fetching data"});
            }
            
        });
    },
    checkDatePeriod:async(periodDate)=>{
        return new Promise(async(resolve,reject)=>{
            var isDate = await Ratingperiods.find({$or: [
                {fromdate: moment.utc(periodDate.fromdate,"DD/MM/YYYY").toDate()}, 
                {todate:moment.utc(periodDate.todate,"DD/MM/YYYY").toDate()}
            ]}).count();
            resolve(isDate);
        });
    },
    saveRatingPeriod: (ratingPeriod) =>{
        return new Promise(async(resolve,reject)=>{
            var isFromDate = await Ratingperiods.find({$and: [
                {fromdate: { $lte:moment.utc(ratingPeriod.fromdate,"DD/MM/YYYY").toDate() }}, 
                {todate: { $gte:moment.utc(ratingPeriod.fromdate,"DD/MM/YYYY").toDate() }}
            ]}).count();
           var isToDate = await Ratingperiods.find({$and: [
                {fromdate: { $lte:moment.utc(ratingPeriod.todate,"DD/MM/YYYY").toDate() }}, 
                {todate: { $gte:moment.utc(ratingPeriod.todate,"DD/MM/YYYY").toDate() }}
            ]}).count();

            if(isFromDate > 0){
                resolve({status:2, msg:"From Date already inbetween the slots!"});
            }
            else if(isToDate > 0){
                resolve({status:2, msg:"To date already inbetween the slots!"});
            } 
            else {
                if(ratingPeriod.data_id != ""){
                    let updateDetails = await Ratingperiods.updateOne({_id:object_id(ratingPeriod.data_id)}, {
                        $set: {
                            fromdate: moment.utc(ratingPeriod.fromdate,"DD/MM/YYYY").toDate(),
                            todate: moment.utc(ratingPeriod.todate,"DD/MM/YYYY").toDate()
                        }
                    });
                    if(updateDetails){
                        resolve({status:1, msg:"Date updated successfully."});
                    }
                    else {
                        resolve({status:0, msg:"Error! Not updated."})
                    }
                }
                else {
                    const periods = new Ratingperiods({
                        fromdate: moment.utc(ratingPeriod.fromdate,"DD/MM/YYYY").toDate(),
                        todate: moment.utc(ratingPeriod.todate,"DD/MM/YYYY").toDate()
                    });
                    
                    let insertDetails = await periods.save();
                    if(insertDetails){
                        resolve({status:1, msg:"Date added successfully."});
                    }else {
                        resolve({status:0, msg:"Error! Date not added. Try again."});
                    }
                }
            }
            
        });
    },
    getAllPeriodList: ()=>{
        return new Promise(async(resolve,reject)=>{
            //query to get all data
            const periodList = await Ratingperiods.aggregate([
                {
                    $project: {
                        fromdate: { $dateToString: { format: "%d-%m-%Y", date: "$fromdate" }},
                        todate: { $dateToString: { format: "%d-%m-%Y", date: "$todate" } },
                        createdDateTime: 1
                    }
                  },
                  { $sort: {createdDateTime:-1}}
                ]);
            if(periodList){
                
                let newList = periodList.map(function(element){
                    return {
                        fromdate: element.fromdate,
                        todate: element.todate,/*moment(element.joinDate,'YYYY-mm-dd hh:mm:ss').format("YYYY-M-d"),*/
                        actions: '<a class="action icon-edit edit-button-period" title="Edit" data-id="'+element._id+'" href="#"><i class="far fa-edit"></i></a><a class="action icon-delete delete-button-period" title="Delete" data-id="'+element._id+'" href="#"><i class="far fa-trash-alt"></i></a>'
                    }
                });
                //console.log(newList);
                resolve(newList);
            }
            else {
                resolve({status:"Error in fetching data"});
            }
        });
    },
    getRatingPeriod:(data)=>{   
        return new Promise(async(resolve,reject)=>{
            await Ratingperiods.aggregate([
                { $match:{_id : object_id(data.pId)}  },
                {
                    $project: {
                        fromdate: { $dateToString: { format: "%d/%m/%Y", date: "$fromdate" }},
                        todate: { $dateToString: { format: "%d/%m/%Y", date: "$todate" } }
                        
                    }
                  },
                  { $limit: 1 }
            ]).then((response)=>{
                resolve(response);
            }).catch((error)=>{
                reject(error);
            });
        });
    },
    deletePeriod:(deleteId)=>{
        return new Promise(async(resolve,reject)=>{
            await Ratingperiods.deleteOne({_id:object_id(deleteId)}).then((response)=>{
                resolve(response);
            }).catch((error)=>{
                reject(error);
            });
        });
    },
    getCountForDash:()=>{
        return new Promise(async(resolve,reject)=>{
            var empCount = await Employees.find().count();
            var hrRatingCount = await hrRating.find().count();
            resolve({emp:empCount, hrRating: hrRatingCount});
        });
    },
    subscribe:(data)=>{
        return new Promise(async(resolve,reject)=>{
            if(data.id == ""){
                let sub1 = new Subscribe({status:data.subscribe});
                sub1.save(function(err, sub){
                    if (err) return console.error(err);
                    resolve({status:true});
                });
                
            }
            else {
                let updated = await Subscribe.updateOne({_id:object_id(data.id)},{
                    $set:{
                        status: data.subscribe,
                        createdDateTime: new Date()
                    }
                });
                if(updated){
                    resolve({status:true});
                }
                else {
                    resolve({status:false});
                }
            }
        });
    },
    getSubscribeStatus:()=>{
        return new Promise(async(resolve,reject)=>{
            let getDetails = await Subscribe.find();
            if(getDetails){
                resolve(getDetails);
            }
            else {
                resolve();
            }
        });
    },
    saveTestData:(testData)=>{
        return new Promise(async(resolve,reject)=>{
            /*let testDataObject = {
                name : testData.Name,
                address : testData.Addess,
                DOB : new Date(testData.DOB),
                identity_check : testData.identity,
                test_name : testData.test_name,
                manufacturer: testData.manufacturer,
                test_date_time: new Date(testData.test_date_time),
                test_done_by: testData.test_done_by,
                test_result: testData.test_result
            } */
            if(testData.data_id != ""){
                let updateDetails = await db.get().collection(collection.TEST_COLLECTION)
                .updateOne({ _id : object_id(testData.data_id) },{
                    $set:{
                        name : testData.Name,
                        address : testData.Address,
                        DOB : testData.DOB,
                        identity_check : testData.identity,
                        test_name : testData.test_name,
                        manufacturer: testData.manufacturer,
                        test_date_time: new Date(testData.test_date_time),
                        test_done_by: testData.test_done_by,
                        test_result: testData.test_result
                    }

                });
                if(updateDetails){
                    resolve({status:true, updated:true});
                } else {
                    resolve({status:false, updated:false});
                }
            }
            else {
                let insertTestDetails = await db.get().collection(collection.TEST_COLLECTION).insertOne({
                    name : testData.Name,
                    address : testData.Address,
                    DOB : testData.DOB,
                    identity_check : testData.identity,
                    test_name : testData.test_name,
                    manufacturer: testData.manufacturer,
                    test_date_time: new Date(testData.test_date_time),
                    test_done_by: testData.test_done_by,
                    test_result: testData.test_result
                }) 
                if(insertTestDetails){
                    resolve({status:true});
                }
                else {
                    resolve({status:false});
                }
            }
            
        });
    },
    getAllTestDetails:()=>{
        return new Promise(async(resolve,reject)=>{
            let testList = await db.get().collection(collection.TEST_COLLECTION).aggregate([
                /*{
                    "$project":{
                        "DOB":{ "$dateToString" :{ "format":"%Y-%m-%d", "date":"$DOB" }},
                        "name": 1,
                        "test_name": 2,
                        "test_date_time": 3,
                        "test_result": 4
                    }
                }*/
                {
                    "$addFields":{
                        /*"DOB":{ "$dateToString" :{ "format":"%d-%m-%Y", "date":"$DOB" }},*/
                        "test_date_time":{ "$dateToString" : {"format":"%d-%m-%Y %H:%M", "date":"$test_date_time"}}
                    }
                }
            ]).toArray();
            if(testList){
                //testList = testList.forEach(x => x.DOB.toLocaleDateString());
                testList.forEach(function(element){
                    element.actions = '<a class="action icon-edit" title="Edit" href="/test/edit/'+element._id+'"><i class="far fa-edit"></i></a><a class="action icon-delete delete-button" title="Delete" data-id="'+element._id+'" href="#"><i class="far fa-trash-alt"></i></a><a class="action icon-download" title="Download" href="/test/download/'+element._id+'"><i class="fas fa-file-download"></i></a>';
                });
                console.log(testList);
                resolve(testList);
            }
            else {
                resolve({status:"Error in fetching data"});
            }
        })
    },
    getTestDetail:(testId)=>{
        return new Promise(async(resolve,reject)=>{
            /*db.get().collection(collection.TEST_COLLECTION).findOne({ _id : object_id(testId) }).then((test)=>{
                resolve(test);
            });*/
            let testDetail = await db.get().collection(collection.TEST_COLLECTION).aggregate([
                { $match : { _id : object_id(testId) } },
                {
                    "$addFields":{
                        /*"DOB":{ "$dateToString" :{ "format":"%d-%m-%Y", "date":"$DOB" }},*/
                        "test_date_time":{ "$dateToString" : {"format":"%m/%d/%Y %H:%M %LZ", "date":"$test_date_time"}}
                    }
                }
            ]).toArray();
            if(testDetail) {
                console.log(testDetail);
                resolve(testDetail);
            }
        })
    },
    deleteTest:(deleteId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.TEST_COLLECTION).deleteOne({_id:object_id(deleteId)}).then((response)=>{
                resolve(response);
            });
        })
    },
    createReport:(testId)=>{
        return new Promise(async(resolve,reject)=>{
            let testDetail = await db.get().collection(collection.TEST_COLLECTION).aggregate([
                { $match : { _id : object_id(testId) } },
                {
                    "$addFields":{
                        "test_date_time":{ "$dateToString" : {"format":"%m/%d/%Y %H:%M %LZ", "date":"$test_date_time"}}
                    }
                }
            ]).toArray();
            if(testDetail) {
                resolve(testDetail);
            }
        });
    }

}
