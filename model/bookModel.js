const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const bookSchema = new Schema({
    bookName: {
        type:String,
        unique:true,
        required : [true, "bookName must be provided"]
    },
    isbnNumber: {
        type:Number,
        required : [true, "isbn Number must be provided"]
    },
    bookPrice: {
        type:Number,
        required : [true, "bookPrice must be provided"]
    },
    authorName: {
        type:String,
        required : [true, "author Name must be provided"]
    },
    publication: {
        type:String,
    },
    publishedAt: {
        type:String,
        required : [true, "publised date must be provided"]
        
    },
    bookImagePath:{
        type:String
    }

    },
    {
    timestamps : true
})

const Book = mongoose.model("Book",bookSchema)
module.exports = Book
