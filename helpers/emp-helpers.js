var db = require('../config/connection');
var collection = require('../config/collections');
var object_id = require('mongodb').ObjectId;
var moment  = require('moment');

var Employees = require('../models/employees.model');
var hrRating = require('../models/hrRating.model');
var empSelfRatings = require('../models/empselfratings.model');
var coworkerRating = require('../models/coworkerRatings.model');

const adminHelper = require('../helpers/admin-helpers');


module.exports = {
    saveEmpData: (empData) =>{
        return new Promise(async(resolve,reject)=>{
            if(empData.data_id != ""){
                /*db.get().collection(collection.EMP_COLLECTION)*/
                let updateDetails = await Employees.updateOne({_id:object_id(empData.data_id)}, {
                    $set: {
                        firstName: empData.firstName,
                        lastName: empData.lastName,
                        street: empData.Street,
                        zipcode: empData.Zipcode,
                        country: empData.Country,
                        email: empData.email_id,
                        phone: empData.Phone,
                        DOB: moment.utc(empData.DOB,"DD/MM/YYYY").toDate(),
                        joinDate: moment.utc(empData.joindate,"DD/MM/YYYY").toDate()
                    }
                });
                if(updateDetails){
                    resolve({status:true, updated:true});
                }
                else {
                    resolve({status:false, updated:false})
                }
            }
            else {
                const employees = new Employees({
                    firstName: empData.firstName,
                    lastName: empData.lastName,
                    street: empData.Street,
                    zipcode: empData.Zipcode,
                    country: empData.Country,
                    email: empData.email_id,
                    phone: empData.Phone,
                    DOB: moment.utc(empData.DOB,"DD/MM/YYYY").toDate(),
                    joinDate: moment.utc(empData.joindate,"DD/MM/YYYY").toDate()
                });
                //new Date(empData.joindate)
                let insertDetails = await employees.save();
                if(insertDetails){
                    resolve({status:true, updated:true});
                }else {
                    resolve({status:false, updated:false});
                }
                
            }
        });
    },
    getAllEmpList: ()=>{
        return new Promise(async(resolve,reject)=>{
            //query to get all data
            const empList = await Employees.aggregate([
                {
                    $project: {
                        firstName: "$firstName",
                        lastName: "$lastName",
                        address: "$address",
                        email: "$email",
                        phone: "$phone",
                        DOB: { $dateToString: { format: "%d-%m-%Y", date: "$DOB" }},
                        joinDate: { $dateToString: { format: "%d-%m-%Y", date: "$joinDate" } }
                        
                    }
                  }
                ]);
            if(empList){
                let graph_uri = "ratings";
                let classname = "";
                await adminHelper.getSubscribeStatus().then((response)=>{
                    if(response.length > 0){
                        if(response[0].status == 'paid'){
                            graph_uri = 'ratings-premium';
                            classname = 'p-tag';
                        }
                        else {
                            graph_uri = 'ratings';
                        }
                    }
                });
                let newList = empList.map(function(element){
                    return {
                        firstName: element.firstName,
                        lastName: element.lastName,
                        address: element.address,
                        email: element.email,
                        phone: element.phone,
                        DOB: element.DOB,
                        joinDate: element.joinDate,/*moment(element.joinDate,'YYYY-mm-dd hh:mm:ss').format("YYYY-M-d"),*/
                        actions: '<a class="action icon-edit" title="Edit" href="/employee/edit/'+element._id+'"><i class="far fa-edit"></i></a><a class="action icon-delete delete-button-emp" title="Delete" data-id="'+element._id+'" href="#"><i class="far fa-trash-alt"></i></a><a class="action emp-detail-view icon-download" title="View details" data-id="'+element._id+'" href="#"><i class="fas fa-file-alt"></i></a><a class="'+classname+'" title="Rating Graph" href="/employee/'+graph_uri+'/'+element._id+'"><i class="fas fa-chart-area"></i></a>'
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
    /*getHrRatingList:()=>{
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
    },*/
    /*getSelfRatingList:()=>{
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
    },*/
    /*getCoworkerRatingList:()=>{
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
    },*/
    deleteEmp:(deleteId)=>{
        return new Promise(async(resolve,reject)=>{
            await Employees.deleteOne({_id:object_id(deleteId)}).then((response)=>{
                resolve(response);
            }).catch((error)=>{
                reject(error);
            });
        });
    },
    getEmpDetail:(empId)=>{
        return new Promise(async(resolve,reject)=>{
            /*await Employees.findOne({_id:object_id(empId)}).lean().then((response)=>{
                resolve(response);
            }).catch((error)=>{
                reject(error);
            });*/
            await Employees.aggregate([
                { $match:{_id : object_id(empId)}  },
                {
                    $project: {
                        firstName: "$firstName",
                        lastName: "$lastName",
                        street: "$street",
                        zipcode: "$zipcode",
                        country: "$country",
                        email: "$email",
                        phone: "$phone",
                        employee_id: "$employeeId",
                        DOB: { $dateToString: { format: "%d/%m/%Y", date: "$DOB" }},
                        joinDate: { $dateToString: { format: "%d/%m/%Y", date: "$joinDate" } }
                        
                    }
                  },
                  { $limit: 1 }
            ]).then((response)=>{
                resolve(response);
            }).catch((error)=>{
                reject(error);
            });
            /*var empData = Employees.findOne({_id:object_id(empId)}).lean();
            if(empData){
                resolve(empData);
            }
            else {
                reject();
            }*/
        });
    },
    getEmployee:(empId)=>{
        return new Promise(async(resolve,reject)=>{
            await Employees.aggregate([
                { $match:{_id : object_id(empId)}  },
                {
                    $project: {
                        employee_id: "$employeeId",
                        first_name: "$firstName",
                        last_name: "$lastName",
                        street: "$street",
                        zipcode: "$zipcode",
                        country: "$country",
                        email: "$email",
                        phone: "$phone",
                        dob: { $dateToString: { format: "%d/%m/%Y", date: "$DOB" }},
                        join_date: { $dateToString: { format: "%d/%m/%Y", date: "$joinDate" } }
                        
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
    getRatingInfo:(empId)=>{ 
        return new Promise(async(resolve,reject)=>{
            const get_info = await Employees.aggregate([
                { $match:{_id : object_id(empId)}  },
                {
                    $lookup:{
                        from:'hrratings',
                        localField:'_id',
                        foreignField:'employeeId',
                        as:'hr_rating_data'
                    }
                },
                {
                    $lookup:{
                        from:'empselfratings',
                        localField:'_id',
                        foreignField:'employeeId',
                        as:'self_rating_data'
                    }
                },
                {
                    $lookup:{
                        from:'coworkerratings',
                        localField:'_id',
                        foreignField:'coworkerId',
                        as:'coworker_rating_data'
                    }
                },
                {
                    $project: { 
                        firstName:1, lastName: 1,
                        "hr_rating_data":{
                            "q1":{$avg: "$hr_rating_data.QA_rate.q1"},
                            "q2":{$avg: "$hr_rating_data.QA_rate.q2"},
                            "q3":{$avg: "$hr_rating_data.QA_rate.q3"},
                            "q4":{$avg: "$hr_rating_data.QA_rate.q4"},
                            "q5":{$avg: "$hr_rating_data.QA_rate.q5"},
                            "q6":{$avg: "$hr_rating_data.QA_rate.q6"},
                            "q7":{$avg: "$hr_rating_data.QA_rate.q7"},
                            "q8":{$avg: "$hr_rating_data.QA_rate.q8"},
                            "q9":{$avg: "$hr_rating_data.QA_rate.q9"},
                            "q10":{$avg: "$hr_rating_data.QA_rate.q10"},
                            "q11":{$avg: "$hr_rating_data.QA_rate.q11"},
                            "q12":{$avg: "$hr_rating_data.QA_rate.q12"},
                            "q13":{$avg: "$hr_rating_data.QA_rate.q13"},
                            "q14":{$avg: "$hr_rating_data.QA_rate.q14"},
                            "q15":{$avg: "$hr_rating_data.QA_rate.q15"},
                            "q16":{$avg: "$hr_rating_data.QA_rate.q16"},
                            "q17":{$avg: "$hr_rating_data.QA_rate.q17"},
                            "q18":{$avg: "$hr_rating_data.QA_rate.q18"},
                            "q19":{$avg: "$hr_rating_data.QA_rate.q19"},
                            "q20":{$avg: "$hr_rating_data.QA_rate.q20"}
                            /*"$map":{
                                "input": "$hr_rating_data",
                                "as": "item",
                                "in": {
                                    "q1": "$$item.QA_rate.q1",
                                    "q2": "$$item.QA_rate.q2",
                                    "createdDateTime" : { $dateToString: { format: "%d-%m-%Y", date: "$$item.createdDateTime" }}
                                }
                            }*/
                        },
                        "self_rating_data":{
                            "q1":{$avg: "$self_rating_data.QA_rate.q1"},
                            "q2":{$avg: "$self_rating_data.QA_rate.q2"},
                            "q3":{$avg: "$self_rating_data.QA_rate.q3"},
                            "q4":{$avg: "$self_rating_data.QA_rate.q4"},
                            "q5":{$avg: "$self_rating_data.QA_rate.q5"},
                            "q6":{$avg: "$self_rating_data.QA_rate.q6"},
                            "q7":{$avg: "$self_rating_data.QA_rate.q7"},
                            "q8":{$avg: "$self_rating_data.QA_rate.q8"},
                            "q9":{$avg: "$self_rating_data.QA_rate.q9"},
                            "q10":{$avg: "$self_rating_data.QA_rate.q10"},
                            "q11":{$avg: "$self_rating_data.QA_rate.q11"},
                            "q12":{$avg: "$self_rating_data.QA_rate.q12"},
                            "q13":{$avg: "$self_rating_data.QA_rate.q13"},
                            "q14":{$avg: "$self_rating_data.QA_rate.q14"},
                            "q15":{$avg: "$self_rating_data.QA_rate.q15"},
                            "q16":{$avg: "$self_rating_data.QA_rate.q16"},
                            "q17":{$avg: "$self_rating_data.QA_rate.q17"},
                            "q18":{$avg: "$self_rating_data.QA_rate.q18"},
                            "q19":{$avg: "$self_rating_data.QA_rate.q19"},
                            "q20":{$avg: "$self_rating_data.QA_rate.q20"}
                            /*"$map":{
                                "input": "$self_rating_data",
                                "as": "item",
                                "in": {
                                    "q1": "$$item.QA_rate.q1",
                                    "q2": "$$item.QA_rate.q2",
                                    "createdDateTime" : { $dateToString: { format: "%d-%m-%Y", date: "$$item.createdDateTime" }}
                                }
                            }*/
                        },
                        "coworker_rating_data":{
                            "q1":{$avg: "$coworker_rating_data.QA_rate.q1"},
                            "q2":{$avg: "$coworker_rating_data.QA_rate.q2"},
                            "q3":{$avg: "$coworker_rating_data.QA_rate.q3"},
                            "q4":{$avg: "$coworker_rating_data.QA_rate.q4"},
                            "q5":{$avg: "$coworker_rating_data.QA_rate.q5"},
                            "q6":{$avg: "$coworker_rating_data.QA_rate.q6"},
                            "q7":{$avg: "$coworker_rating_data.QA_rate.q7"},
                            "q8":{$avg: "$coworker_rating_data.QA_rate.q8"},
                            "q9":{$avg: "$coworker_rating_data.QA_rate.q9"},
                            "q10":{$avg: "$coworker_rating_data.QA_rate.q10"},
                            "q11":{$avg: "$coworker_rating_data.QA_rate.q11"},
                            "q12":{$avg: "$coworker_rating_data.QA_rate.q12"},
                            "q13":{$avg: "$coworker_rating_data.QA_rate.q13"},
                            "q14":{$avg: "$coworker_rating_data.QA_rate.q14"},
                            "q15":{$avg: "$coworker_rating_data.QA_rate.q15"},
                            "q16":{$avg: "$coworker_rating_data.QA_rate.q16"},
                            "q17":{$avg: "$coworker_rating_data.QA_rate.q17"},
                            "q18":{$avg: "$coworker_rating_data.QA_rate.q18"},
                            "q19":{$avg: "$coworker_rating_data.QA_rate.q19"},
                            "q20":{$avg: "$coworker_rating_data.QA_rate.q20"}
                            /*"$map":{
                                "input": "$coworker_rating_data.QA_rate",
                                "as": "item",
                                "in": {
                                    "q1": {$avg :"$$item.q1"}
                                }
                            }*/
                        } 
                    }
                }
            ]);
            
            if(get_info){
                resolve(get_info);
            }
        })
    }
};