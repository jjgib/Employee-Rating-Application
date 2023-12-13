var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
var object_id = require('mongodb').ObjectId;

var User = require('../models/user.model');


module.exports = {

    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password = await bcrypt.hash(userData.Password,10);
            /*db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data);
            });*/
            User.insertOne(userData).then((data)=>{
                resolve(data);
            });
        });
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false;
            let response = {};
            //let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email});
            let isUser = await User.findOne({Email:userData.Email});
            if(isUser){
                bcrypt.compare(userData.Password,isUser.Password).then((status)=>{
                    if(status){
                        console.log("Login success");
                        response.user = isUser;
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
