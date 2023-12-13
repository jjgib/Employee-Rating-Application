var db = require('../config/connection');
var collection = require('../config/collections');
var object_id = require('mongodb').ObjectId;
var moment  = require('moment');

var Employees = require('../models/employees.model');
var hrRating = require('../models/hrRating.model');
var empSelfRatings = require('../models/empselfratings.model');
var coworkerRating = require('../models/coworkerRatings.model');
var ratingPeriods = require('../models/ratingperiods.model');

module.exports = {
    getAllDateSlots:()=>{
        return new Promise(async(resolve,reject)=>{
            let allDates = await ratingPeriods.aggregate([
                {
                    $project: { 
                        fromdate: { $dateToString: { format: "%d-%m-%Y", date: "$fromdate" }},
                        todate: { $dateToString: { format: "%d-%m-%Y", date: "$todate" }}
                    }
                }
            ]);
            if(allDates.length > 0){
                resolve(allDates);
            }
            
        });
    },
    getEmpDetail:(empId)=>{
        return new Promise(async(resolve,reject)=>{
            await Employees.aggregate([
                {$match:{_id: object_id(empId)} },
                {
                    $project: {
                        firstname: "$firstname",
                        lastname: "$lastname",
                        employee_id:"$employeeId"
                    }
                },
                {$limit:1}
            ]).then((response)=>{
                resolve(response);
            }).catch((response)=>{
                reject(response);
            });
        });
    },
    getAllDateSlots2:(dateId)=>{
        return new Promise(async(resolve,reject)=>{
            let dateList = await ratingPeriods.aggregate([
                {
                    $project: { 
                        fromdate: { $dateToString: { format: "%d-%m-%Y", date: "$fromdate" }},
                        todate: { $dateToString: { format: "%d-%m-%Y", date: "$todate" }}
                    }
                }
            ]);
            if(dateList.length > 0){
               /* let newDateList = dateList.map((element)=>{
                    if(element._id != dateId){
                        return {
                            _id:element._id,
                            fromdate:element.fromdate,
                            todate:element.todate
                        }
                    }
                });*/
                let newDateList = dateList.filter(function(value, index, arr){ 
                    return value['_id'] != dateId;
                });
                resolve(newDateList);
            }
            
        });
    },
    getHRratingData:(data)=>{
        return new Promise(async(resolve,reject)=>{
            
            let date1 = data.date1_id;
            let date2 = data.date2_id;
            let userId = data.ID;
            
            let rating_data_date1 = await hrRating.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date1) }   }
            ]);
            if(rating_data_date1.length > 0){
                rating_data_date1.forEach((element)=>{
                    element.dateSlot = 1;
                });
            }

            let rating_data_date2 = await hrRating.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date2) }   }
            ]);
            if(rating_data_date2.length > 0){
                rating_data_date2.forEach((element)=>{
                    element.dateSlot = 2;
                });
                //combining two rating datas
                for(var i = 0; i < rating_data_date2.length ; i++){
                    rating_data_date1.push(rating_data_date2[i]);
                }
            }
            
            /*if(rating_data_date1.length > 0 && rating_data_date2.length > 0){
                rating_data_date1[rating_data_date1.length]= rating_data_date2[0];
            }*/
            
            //Self rating
            let selfrating_data_date1 = await empSelfRatings.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date1) }   }
            ]);
            if(selfrating_data_date1.length > 0){
                selfrating_data_date1.forEach((element)=>{
                    element.dateSlot = 1;
                });
            }
            let selfrating_data_date2 = await empSelfRatings.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date2) }   }
            ]);
            if(selfrating_data_date2.length > 0){
                selfrating_data_date2.forEach((element)=>{
                    element.dateSlot = 2;
                });
                for(var i = 0; i < selfrating_data_date2.length ; i++){
                    selfrating_data_date1.push(selfrating_data_date2[i]);
                }
            }
            
            //coworker rating
            let coRating_data_date1 = await coworkerRating.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date1) }   },
                {   $unwind: "$QA_rate" },
                {
                    $group :{
                        _id:"$employeeId",
                        q1:{$avg:"$QA_rate.q1"},
                        q2:{$avg:"$QA_rate.q2"},
                        q3:{$avg:"$QA_rate.q3"},
                        q4:{$avg:"$QA_rate.q4"},
                        q5:{$avg:"$QA_rate.q5"},
                        q6:{$avg:"$QA_rate.q6"},
                        q7:{$avg:"$QA_rate.q7"},
                        q8:{$avg:"$QA_rate.q8"},
                        q9:{$avg:"$QA_rate.q9"},
                        q10:{$avg:"$QA_rate.q10"},
                        q11:{$avg:"$QA_rate.q11"},
                        q12:{$avg:"$QA_rate.q12"},
                        q13:{$avg:"$QA_rate.q13"},
                        q14:{$avg:"$QA_rate.q14"},
                        q15:{$avg:"$QA_rate.q15"},
                        q16:{$avg:"$QA_rate.q16"},
                        q17:{$avg:"$QA_rate.q17"},
                        q18:{$avg:"$QA_rate.q18"},
                        q19:{$avg:"$QA_rate.q19"},
                        q20:{$avg:"$QA_rate.q20"}
                    }
                },
                {
                    $project: { 
                        "QA_rate":{
                            q1:"$q1",
                            q2:"$q2",
                            q3:"$q3",
                            q4:"$q4",
                            q5:"$q5",
                            q6:"$q6",
                            q7:"$q7",
                            q8:"$q8",
                            q9:"$q9",
                            q10:"$q10",
                            q11:"$q11",
                            q12:"$q12",
                            q13:"$q13",
                            q14:"$q14",
                            q15:"$q15",
                            q16:"$q16",
                            q17:"$q17",
                            q18:"$q18",
                            q19:"$q19",
                            q20:"$q20"
                        }
                    }
                }
            ]);
            if(coRating_data_date1.length > 0){
                coRating_data_date1.forEach((element)=>{
                    element.dateSlot = 1;
                });
            }
            let coRating_data_date2 = await coworkerRating.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date2) }   },
                {   $unwind: "$QA_rate" },
                {
                    $group :{
                            _id:"$employeeId",
                            q1:{$avg:"$QA_rate.q1"},
                            q2:{$avg:"$QA_rate.q2"},
                            q3:{$avg:"$QA_rate.q3"},
                            q4:{$avg:"$QA_rate.q4"},
                            q5:{$avg:"$QA_rate.q5"},
                            q6:{$avg:"$QA_rate.q6"},
                            q7:{$avg:"$QA_rate.q7"},
                            q8:{$avg:"$QA_rate.q8"},
                            q9:{$avg:"$QA_rate.q9"},
                            q10:{$avg:"$QA_rate.q10"},
                            q11:{$avg:"$QA_rate.q11"},
                            q12:{$avg:"$QA_rate.q12"},
                            q13:{$avg:"$QA_rate.q13"},
                            q14:{$avg:"$QA_rate.q14"},
                            q15:{$avg:"$QA_rate.q15"},
                            q16:{$avg:"$QA_rate.q16"},
                            q17:{$avg:"$QA_rate.q17"},
                            q18:{$avg:"$QA_rate.q18"},
                            q19:{$avg:"$QA_rate.q19"},
                            q20:{$avg:"$QA_rate.q20"}
                    }
                },
                {
                    $project: { 
                        "QA_rate":{
                            q1:"$q1",
                            q2:"$q2",
                            q3:"$q3",
                            q4:"$q4",
                            q5:"$q5",
                            q6:"$q6",
                            q7:"$q7",
                            q8:"$q8",
                            q9:"$q9",
                            q10:"$q10",
                            q11:"$q11",
                            q12:"$q12",
                            q13:"$q13",
                            q14:"$q14",
                            q15:"$q15",
                            q16:"$q16",
                            q17:"$q17",
                            q18:"$q18",
                            q19:"$q19",
                            q20:"$q20"
                        }
                    }
                }
                
            ]);
            if(coRating_data_date2.length > 0){
                coRating_data_date2.forEach((element)=>{
                    element.dateSlot = 2;
                });
                for(var i = 0; i < coRating_data_date2.length ; i++){
                    coRating_data_date1.push(coRating_data_date2[i]);
                }
            }
            console.log(coRating_data_date1);

            resolve({hr_data: rating_data_date1, self_data: selfrating_data_date1, co_data: coRating_data_date1});
        });
    },
    getSelfRatingData:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let date1 = data.date1_id;
            let date2 = data.date2_id;
            let userId = data.ID;

            let rating_data_date1 = await empSelfRatings.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date1) }   }
            ]);
            rating_data_date1.forEach((element)=>{
                element.dateSlot = 1;
            });

            let rating_data_date2 = await empSelfRatings.aggregate([
                {   $match: { employeeId:object_id(userId), dateSlotId:object_id(date2) }   }
            ]);
            rating_data_date2.forEach((element)=>{
                element.dateSlot = 2;
            });
            for(var i = 0; i < rating_data_date2.length ; i++){
                rating_data_date1.push(rating_data_date2[i]);
            }

            resolve(rating_data_date1);
        });
    }
};