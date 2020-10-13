const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });
const Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const { isEmail } = require('validator');

const UserSchema = new Schema({ 
    username: { type: String, unique: true },
    emailid: { type: String, unique: true, validate: [isEmail, 'Please fill a valid email address'] },
    password: { type: String },
    confirm_password: { type: String }, 
    imageUrl: {type: String },
    requestFrom: [{ type: String }],
    requestTo: [{ type: String }],
    friends: [{ type: String }],
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
});


UserSchema.plugin(beautifyUnique);
mongoose.model('user', UserSchema);
