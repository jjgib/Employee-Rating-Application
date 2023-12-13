var db = require('../config/connection');
var collection = require('../config/collections');
var object_id = require('mongodb').ObjectId;
var moment  = require('moment');

var Employees = require('../models/employees.model');
var HRRating = require('../models/hrRating.model');
var empselfratings = require('../models/empselfratings.model');
var coworkerRatings = require('../models/coworkerRatings.model');
var Workreports = require('../models/workReports.model');

var ratingPeriods = require('../models/ratingperiods.model');

module.exports = {
    fetchEmpData:(empName)=>{ //For rating form for Hr managers
        return new Promise(async(resolve,reject)=>{
            //var employeeFilter = await Employees.find({firstName:empName},{'firstName':1,'employeeId':1}).sort({"createdDateTime":-1}).limit(20);
            var employeeFilter = await Employees.find({
                $or:[
                    {firstName:empName},
                    {lastName:empName}
                ]},
                {'firstName':1,'lastName':1,'employeeId':1}).sort({"createdDateTime":-1}).limit(20);
            var result = [];
            if(employeeFilter && employeeFilter.length && employeeFilter.length > 0){
                employeeFilter.forEach(user=>{
                    let obj = {
                        id:user._id,
                        text: user.firstName+" "+user.lastName+" ("+user.employeeId+")"
                    };
                    result.push(obj);
                });
                resolve(result);
            }
            else {
                resolve(employeeFilter);
            }
                

         
        })
    },
    fetchCoworkerData:(empName,userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            var filterEmployee = await Employees.find({
                $and:[
                {$or: [{"firstName":empName}, {"lastName":empName}]},
                /*{"firstName":empName},*/
                {"_id":{$ne : object_id(userId)}}
            ]}).sort({"createdDateTime":-1}).limit(20);
            var result = [];
            if(filterEmployee && filterEmployee.length && filterEmployee.length > 0){
                filterEmployee.forEach(user=>{
                    let obj = {
                        id:user._id,
                        text: user.firstName+" "+user.lastName
                    };
                    result.push(obj);
                });
                resolve(result);
            }
            else {
                resolve(filterEmployee);
            }
        });
    },
    saveHrFormData:(formData)=>{
        return new Promise(async(resolve,reject)=>{
            
            let sum = parseInt(formData.q1)+parseInt(formData.q2)+parseInt(formData.q3)+parseInt(formData.q4)+parseInt(formData.q5)+parseInt(formData.q6)+parseInt(formData.q7)+parseInt(formData.q8)+parseInt(formData.q9)+parseInt(formData.q10)+parseInt(formData.q11)+parseInt(formData.q12)+parseInt(formData.q13)+parseInt(formData.q14)+parseInt(formData.q15)+parseInt(formData.q16)+parseInt(formData.q17)+parseInt(formData.q18)+parseInt(formData.q19)+parseInt(formData.q20);
            let d = moment().utcOffset(0); // current date
            d.set({hour:0,minute:0,second:0,millisecond:0}); //Set date with time to 0000
            d.toISOString();
            d.format();
            const dateSlot = await ratingPeriods.find({
               $and:[ {fromdate:{$lte: d}}, {todate:{$gte: d}} ] 
            });
           
            if(dateSlot.length > 0){
                const isExist =  await HRRating.find({$and: [
                    {"employeeId": object_id(formData.employee_id)},
                    {"dateSlotId": object_id(dateSlot[0]._id)}
                ]}).count();

                if(isExist > 0){
                    resolve({status:2, message:"You have already rated this person in this date slot"});
                }
                else {
                    const hr_rating = new HRRating({
                        hr_manager_email: formData.hr_email,
                        employeeId: formData.employee_id,
                        QA_rate: {
                            q1: formData.q1,
                            q2: formData.q2,
                            q3: formData.q3,
                            q4: formData.q4,
                            q5: formData.q5,
                            q6: formData.q6,
                            q7: formData.q7,
                            q8: formData.q8,
                            q9: formData.q9,
                            q10: formData.q10,
                            q11: formData.q11,
                            q12: formData.q12,
                            q13: formData.q13,
                            q14: formData.q14,
                            q15: formData.q15,
                            q16: formData.q16,
                            q17: formData.q17,
                            q18: formData.q18,
                            q19: formData.q19,
                            q20: formData.q20
                        },
                        dateSlotId : dateSlot[0]._id,
                        total_rate: sum
                    });
                    let insertDetails = await hr_rating.save();
                    if(insertDetails){
                        resolve({status:1, message:"Data saved successfully!"});
                    }
                    else {
                        resolve({status: 0, message:"Error in saving data. Try again."});
                    }
                }

            }
            else {
                reject({status:3, message:"Date period not added."});
            }
            
            
        });
    },
    saveSelfRating:(formData)=>{
        return new Promise(async(resolve,reject)=>{
            let empId = formData.employee_id;
            let d = moment().utcOffset(0);
            d.set({hour:0,minute:0,second:0,millisecond:0}); //Set date with time to 0000
            d.toISOString();
            d.format();
            //let datePeriod = new Date(d.setMonth(d.getMonth() - 2));
            
            const dateSlot = await ratingPeriods.find({
                $and:[ {fromdate:{$lte: d}}, {todate:{$gte: d}} ] 
             });
            /*let checkDate = await empselfratings.find({$and: [
                {"employeeId": object_id(empId)},
                {"createdDateTime":{ $gte:datePeriod, $lte: new Date()}}
            ]}).count();*/

            if(dateSlot.length > 0){
                const isExist =  await empselfratings.find({$and: [
                    {"employeeId": object_id(empId)},
                    {"dateSlotId": object_id(dateSlot[0]._id)}
                ]}).count();
                if(isExist > 0){
                    resolve({status:2,message:"You have rated yourself in this date slot"});
                    
                }
                else {
                    let sum = parseInt(formData.q1)+parseInt(formData.q2)+parseInt(formData.q3)+parseInt(formData.q4)+parseInt(formData.q5)+parseInt(formData.q6)+parseInt(formData.q7)+parseInt(formData.q8)+parseInt(formData.q9)+parseInt(formData.q10)+parseInt(formData.q11)+parseInt(formData.q12)+parseInt(formData.q13)+parseInt(formData.q14)+parseInt(formData.q15)+parseInt(formData.q16)+parseInt(formData.q17)+parseInt(formData.q18)+parseInt(formData.q19)+parseInt(formData.q20);
                    const empSelfModel = new empselfratings({
                        employeeId: formData.employee_id,
                        QA_rate: {
                            q1: formData.q1,
                            q2: formData.q2,
                            q3: formData.q3,
                            q4: formData.q4,
                            q5: formData.q5,
                            q6: formData.q6,
                            q7: formData.q7,
                            q8: formData.q8,
                            q9: formData.q9,
                            q10: formData.q10,
                            q11: formData.q11,
                            q12: formData.q12,
                            q13: formData.q13,
                            q14: formData.q14,
                            q15: formData.q15,
                            q16: formData.q16,
                            q17: formData.q17,
                            q18: formData.q18,
                            q19: formData.q19,
                            q20: formData.q20
                        },
                        total_rate: sum,
                        dateSlotId : dateSlot[0]._id
                    });
                    let insertSelfRate = await empSelfModel.save();
                    if(insertSelfRate){
                        resolve({status:1,message:"Data saved successfully!"});
                    }
                    else {
                        resolve({status:0,message:"Error in saving data. Try again."});
                    }
                }
            }
            else {
                reject({status:3, message:"Date period not added."});
            }
            
            
            
            
            //resolve(sum);
            //db.data.find({created:{$gte:d}}); 
        });
    },
    saveCoworkerRating:(formData)=>{
        return new Promise(async(resolve,reject)=>{
            let coworkerId = formData.coworker_id;
            let empId = formData.employee_id;
            let d = moment().utcOffset(0);
            d.set({hour:0,minute:0,second:0,millisecond:0}); //Set date with time to 0000
            d.toISOString();
            d.format();
            
            const dateSlot = await ratingPeriods.find({
                $and:[ {fromdate:{$lte: d}}, {todate:{$gte: d}} ] 
             });
            if(dateSlot.length > 0){
                let isExist = await coworkerRatings.find({$and: [
                    {"coworkerId": object_id(coworkerId)},
                    {"employeeId": object_id(empId)},
                    {"dateSlotId": object_id(dateSlot[0]._id)}
                ]}).count();
                if(isExist > 0){
                    resolve({status:2,message:"You have rated this person in this date slot"});
                    
                }
                else {
                    let sum = parseInt(formData.q1)+parseInt(formData.q2)+parseInt(formData.q3)+parseInt(formData.q4)+parseInt(formData.q5)+parseInt(formData.q6)+parseInt(formData.q7)+parseInt(formData.q8)+parseInt(formData.q9)+parseInt(formData.q10)+parseInt(formData.q11)+parseInt(formData.q12)+parseInt(formData.q13)+parseInt(formData.q14)+parseInt(formData.q15)+parseInt(formData.q16)+parseInt(formData.q17)+parseInt(formData.q18)+parseInt(formData.q19)+parseInt(formData.q20);
                    const coworkerModel = new coworkerRatings({
                        coworkerId: formData.coworker_id,
                        employeeId: formData.employee_id,
                        QA_rate: {
                            q1: formData.q1,
                            q2: formData.q2,
                            q3: formData.q3,
                            q4: formData.q4,
                            q5: formData.q5,
                            q6: formData.q6,
                            q7: formData.q7,
                            q8: formData.q8,
                            q9: formData.q9,
                            q10: formData.q10,
                            q11: formData.q11,
                            q12: formData.q12,
                            q13: formData.q13,
                            q14: formData.q14,
                            q15: formData.q15,
                            q16: formData.q16,
                            q17: formData.q17,
                            q18: formData.q18,
                            q19: formData.q19,
                            q20: formData.q20
                        },
                        total_rate: sum,
                        dateSlotId : dateSlot[0]._id
                    });
                    let insertCoworkerRate = await coworkerModel.save();
                    if(insertCoworkerRate){
                        resolve({status:1,message:"Data saved successfully!"});
                    }
                    else {
                        resolve({status:0,message:"Error in saving data. Try again."});
                    }
                }
            }
            else {
                reject({status:3, message:"Date period not added."});
            }
            
        });
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {};
            let dob = moment.utc(userData.emp_dob,'DD/MM/YYYY').toDate();
            let user = await Employees.findOne({employeeId:userData.emp_id, 
                DOB:dob });
            if(user){
                console.log("Login success");
                response.user = user;
                response.status = true;
                resolve(response);
            }
            else {
                response.status = false;
                console.log("Login failed");
                resolve(response);
            }
            
        })
    },
    getSelfRatingList:(empId)=>{
        return new Promise(async(resolve,reject)=>{
            let ratingList = await empselfratings.aggregate([
                { $match:{employeeId : object_id(empId)}  },
                {
                    $lookup:{
                        from:'employees',
                        localField:'employeeId',
                        foreignField:'_id',
                        as:'emp_data'
                    }
                },
                {
                    $project: { total_rate: 1, createdDateTime:1, createdDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
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
    getReportList:(empId)=>{
        return new Promise(async(resolve,reject)=>{
            /*let d = moment().utcOffset(0);
            d.set({hour:0,minute:0,second:0,millisecond:0});
            d.toISOString();
            d.format();*/
            

            let reportList = await Workreports.aggregate([
                { $match:{employeeId : object_id(empId)}  },
                {
                    $project: { title: 1, description:1, is_verified:1, submitDate: { $dateToString: { format: "%d-%m-%Y", date: "$createdDateTime" }}}
                },
                {
                    $sort: {createdDateTime: -1}
                }
            ]);

            if(reportList){
                let reportList2 = reportList.map(function(element){
                    let status_icon = "";
                    let shorten_desc = element.description.substring(0,150).concat('...');
                    if(element.is_verified == "not verified"){
                        status_icon = '<i class="v-icon blue fas fa-check-circle"></i>';
                    } else {
                        status_icon = '<i class="v-icon green fas fa-check-circle"></i>';
                    }
                    let quick_view = '<a href="#" title="View Report"><i class="far fa-file-alt"></i></a>';
                    return {
                        title: element.title,
                        description: shorten_desc,
                        submitDate: element.submitDate,
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
    saveReport:(reportData)=>{
        return new Promise(async(resolve,reject)=>{
            
            const start = moment().startOf('day').toDate();
            const end = moment().startOf('day').add(1, 'day').toDate();
            /*const isExist =  await Workreports.find({ 
                createdDateTime: {
                    $gte: start,
                    $lt: end
                }
            }).count();
            if(isExist > 0){
                resolve({status:2, updated:false});
            }
            else { */
                const workreports = new Workreports({
                    employeeId: reportData.employee_id,
                    title:reportData.title,
                    description: reportData.desc,
                    is_verified: "not verified"
                });
                let insertDetails = await workreports.save(); 
                if(insertDetails){
                    resolve({status:1, updated:true});
                }else {
                    resolve({status:0, updated:false});
                }
           // }
            
        });
    }
};