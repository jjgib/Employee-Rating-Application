const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const EmpSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    DOB: Date,
    employeeId: Number,
    street: String,
    zipcode: String,
    country: String,
    email: String,
    phone: String,
    joinDate: Date,
    createdDateTime:{ type: Date, default: Date.now }
});

EmpSchema.plugin(AutoIncrement, {id:'employeeId_seq', inc_field: 'employeeId', start_seq:10000, inc_amount: 1}); 
module.exports = mongoose.model('Employees', EmpSchema);

