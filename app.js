const express = require('express')
const connectDB = require('./database');
const Book = require('./model/bookModel');
const app = express()
const fs = require('fs').promises
const cors = require("cors");

app.use(express.json())


require('dotenv').config();
connectDB(process.env.MONGO_URI)
const upload = require('./middleware/multerConfig');
const path = require('path');
app.use(
  cors({
    origin: ["https://bookstore-frontend-murex-mu.vercel.app"], // frontend URLs
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true, // only if using cookies
  })
);
app.get("/",(req,res)=>{
    res.status(201).json({
        message:"Nodejs started"
})
})

//book create
app.post("/book", upload.single("image"), async (req, res) => {
    let fileName = "staticbook.jpg"; // default image

    try {
        // Use uploaded filename if provided
        if (req.file && req.file.filename) {
            fileName = req.file.filename;
        }

        const {
            bookName,
            bookPrice,
            isbnNumber,
            authorName,
            publishedAt,
            publication
        } = req.body;

        // Basic validation
        if (!bookName || !bookPrice) {
            throw new Error("Book name and price are required");
        }

        // Create new book entry
        await Book.create({
            bookName,
            bookPrice,
            isbnNumber,
            authorName,
            publishedAt,
            publication,
            bookImagePath: `https://bookstore-backend-hm71.onrender.com/${fileName}`,
        });

        res.status(201).json({
            message: "Book created successfully",
            bookId: newBook._id, // Include the ID
        });

    } catch (err) {
        console.error("Error creating book:", err.message);

        // If an image was uploaded, clean up on error
        if (req.file && req.file.filename) {
            try {
                await fs.unlink(path.join("storage", req.file.filename));
                console.log("Uploaded image deleted due to error");
            } catch (unlinkErr) {
                console.error("Error deleting uploaded image:", unlinkErr.message);
            }
        }

        res.status(500).json({
            message: "Something went wrong while creating the book",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
});

// fetch all books
app.get("/book",async(req,res)=>{
//     const limit = parseInt(req.query.limit) || 10;
//   const books = await Book.find().limit(limit); // adjust as needed
  

    const Books = await Book.find()

        res.status(200).json({
        message:"Book fetched successfully",
        data:Books

    })


})
// single book fetch
const mongoose = require("mongoose");

app.get("/book/:id", async (req, res) => {
    
    const id = req.params.id;

    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: `Invalid book ID format: ${id}`,
        });
    }

    try {
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                message: `Book with ID: ${id} not found in the database.`,
            });
        }

        res.status(200).json({
            message: "Single book fetched successfully.",
            data:book
        });

    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({
            message: "Something went wrong while fetching the book.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});


// delete book


app.delete("/book/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                message: `Book with ID: ${id} not found.`,
            });
        }

        // Delete image file if bookImagePath exists and is a local storage URL
        if (book.bookImagePath) {
            try {
                const imageUrl = new URL(book.bookImagePath);
                const imageFileName = path.basename(imageUrl.pathname);
                const imagePath = path.join("storage", imageFileName);

                await fs.unlink(imagePath);
                console.log(`Deleted image file: ${imagePath}`);
            } catch (err) {
                console.error("Error deleting image file:", err.message);
                // Continue even if image deletion fails
            }
        }

        // Delete the book from database
        await Book.findByIdAndDelete(id);

        res.status(200).json({
            message: `Book with ID: ${id} deleted successfully, including image file.`,
        });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({
            message: "Something went wrong while deleting the book.",
        });
    }
});



// update book

app.patch("/book/:id", upload.single("image"), async (req, res) => {
    const id = req.params.id;

    try {
        const oldData = await Book.findById(id);

        if (!oldData) {
            // Delete uploaded file if book doesn't exist
            if (req.file) {
                try {
                    await fs.unlink(path.join("storage", req.file.filename));
                    console.log("Uploaded image deleted because book not found");
                } catch (err) {
                    console.error("Error deleting uploaded image:", err);
                }
            }

            return res.status(404).json({ message: "Book not found" });
        }

        const {
            bookName,
            bookPrice,
            isbnNumber,
            publication,
            publishedAt,
            authorName,
        } = req.body;

        let fileName = oldData.bookImagePath; // Keep old image path by default

        if (req.file && req.file.filename) {
            // Delete old image
            try {
                const oldFilename = path.basename(oldData.bookImagePath);
                await fs.unlink(path.join("storage", oldFilename));
                console.log("Old image deleted successfully");
            } catch (err) {
                console.error("Error deleting old image:", err);
            }

            // Set new image path
            fileName = `https://bookstore-frontend-murex-mu.vercel.app/${req.file.filename}`;
        }

        // Update book
        await Book.findByIdAndUpdate(id, {
            bookName,
            bookPrice,
            isbnNumber,
            authorName,
            publishedAt,
            publication,
            bookImagePath: fileName,
        });

        res.status(200).json({ message: "Book updated successfully" });

    } catch (err) {
        console.error("Update error:", err);

        // Cleanup uploaded image if error occurred
        if (req.file && req.file.filename) {
            try {
                await fs.unlink(path.join("storage", req.file.filename));
                console.log("Uploaded image deleted due to error");
            } catch (cleanupErr) {
                console.error("Error cleaning up uploaded image:", cleanupErr);
            }
        }

        res.status(500).json({ message: "Server error" });
    }
});


        
// Error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('File too large. Max size is 1MB.');
    }

    if (err.message === 'Only JPEG and PNG files are allowed') {
        return res.status(400).send(err.message);
    }

    res.status(500).send('Something went wrong');
});


app.use(express.static("./storage/"))
app.listen(process.env.PORT)