const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });
const Schema = mongoose.Schema;
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const uuid = require('node-uuid');

const MessageSchema = new Schema({
    content: { type: String },
    uuid: { type: String, default: uuid.v1 },
    from: { type: String },
    to: { type: String },
    reaction: { type: String },
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
});

MessageSchema.plugin(beautifyUnique);
mongoose.model('message', MessageSchema);