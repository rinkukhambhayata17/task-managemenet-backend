var express = require('express');
var app = express();
const PORT = 5000;
var sqlite3 = require('sqlite3');
var dbFile = './config/database.db';
const cors = require('cors');
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database(dbFile, (err) => {
    if(err){
        console.log("Error connecting to database");
    }else{
        db.run(`CREATE TABLE IF NOT EXISTS sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT)`, (err) => {
                if(err){
                    console.error('Error creating table:', err.message);
                }else{
                    console.log('Table "sections" created or already exists.');
                }
            })

        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sectionId INTEGER NOT NULL,
            name TEXT,
            createdDate DATE NOT NULL,
            FOREIGN KEY (sectionId) REFERENCES sections (id))`, (err) => {
                if(err){
                    console.error('Error creating table:', err.message);
                }else{
                    console.log('Table "tasks" created or already exists.');
                }
            })
    }
})

// Create new section
app.post('/sections', (req,res) => {
    try{
        console.log('inside create new section ',req)
        let { name } = req.body;

        if(name){
            const query = "INSERT INTO sections ( name ) VALUES ( ? )";

            db.run(query, [name], (err) => {
                if(err){
                    console.log("Error inserting post:", err);
                    return res.status(500).json({ message: 'Error inserting post' });
                }
                console.log('Section added with ID:', this.lastID);
                return res.status(201).json({
                    message: "Section Created Successfully!",
                    data: {
                        id: this.lastID,
                        name
                    }
                }); 
            })
        }else {
            return res.status(400).json({ message: 'Name is required' });
        }

    }catch(err){
        console.log("Error in /sections route:", err);
        return res.status(500).json({ message: 'Server error' });
    }
})

// Get all sections
app.get('/sections', (req,res) => {
    try{
        const query = "SELECT * FROM sections";

        db.all(query, (err, rows) => {
            if(err){
                console.log("Error getting sections:", err);
                return res.status(500).json({ message: 'Error fetching sections' });
            }
            if(rows.length > 0){
                return res.status(201).json({
                    message: "Sections listed successfully!",
                    data: rows
                });
            }else{
                console.log("No sections found:", err);
                return res.status(500).json({ message: 'No sections found' });
            }
        })

    }catch(err){
        console.log("Error in /sections route:", err);
        return res.status(500).json({ message: 'Server error' });
    }
})

// get all tasks of specific section
app.get('/tasks/section/:sectionId', (req,res) => {
    try{
        const id = req.params.sectionId;
        console.log('id ??',id)
        const query = 'SELECT * FROM tasks WHERE sectionId = ?'

        db.all(query, [id], (err, rows) => {
            if(err){
                console.log("Error fetching tasks:", err);
                return res.status(500).json({ message: 'Error fetching tasks' });
            }
            console.log('rows ?? ',rows)
            if (!rows) {
                return res.status(404).json({ message: 'Tasks not found' });
            }

            return res.status(200).json({message: 'Tasks fetched successfully!', data: rows});
        })
    }catch(err){
        console.log("Error in /sections route:", err);
        return res.status(500).json({ message: 'Server error' });
    }
})

// Add task for specific section
app.post('/tasks/section/:sectionId', (req,res) => {
    try{
        const { id } = req.params;
        let { name } = req.body;
        let createdDate = new Date().toISOString();

        if(id && name){
            const query = 'INSERT INTO tasks (sectionId, name, createdDate) VALUES (?, ?, ?)';
            db.run(query, [id, name, createdDate], (err) => {
                if(err){
                    console.log('Error creating task');
                    return res.status(400).json({ message: 'Error creating task' });
                }

                return res.status(201).json({
                    message: "Task added successfully!",
                    data:{
                        id: this.lastID,
                        sectionId: id,
                        name,
                        createdDate
                    }
                });
            })
        }else{
            return res.status(400).json({ message: 'Name is required' });
        }
    }catch(err){
        console.log("Error in /tasks route:", err);
        return res.status(500).json({ message: 'Server error' });
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})