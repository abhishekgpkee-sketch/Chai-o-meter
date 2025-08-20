const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// File upload setup
const storage = multer.diskStorage({
  destination: function(req, file, cb){ cb(null,'public/uploads'); },
  filename: function(req, file, cb){ cb(null, Date.now()+"_"+file.originalname); }
});
const upload = multer({storage});

// Leaderboard file
const leaderboardFile = path.join(__dirname,'leaderboard.json');
if(!fs.existsSync(leaderboardFile)) fs.writeFileSync(leaderboardFile, JSON.stringify({}));

function getTodayKey(){ return new Date().toISOString().slice(0,10); }

// Get today's leaderboard
app.get('/api/leaderboard',(req,res)=>{
  const data = JSON.parse(fs.readFileSync(leaderboardFile));
  const today = getTodayKey();
  res.json(data[today] || []);
});

// Add user entry
app.post('/api/add', upload.single('photo'), (req,res)=>{
  const {name, cups} = req.body;
  if(!name || !cups) return res.status(400).json({error:"Name and cups required"});
  const photo = req.file ? '/uploads/' + req.file.filename : null;

  const data = JSON.parse(fs.readFileSync(leaderboardFile));
  const today = getTodayKey();
  if(!data[today]) data[today]=[];
  data[today].push({name, cups: parseInt(cups), photo});
  fs.writeFileSync(leaderboardFile, JSON.stringify(data,null,2));
  res.json({success:true});
});

// Start server
app.listen(PORT,()=>console.log(`Server running at http://localhost:${PORT}`));
