

const express =require("express");
const app=express();


const mainRouter=require("../backend/routes/index");
const cors = require("cors");
const { log } = require("console");


app.use(cors());
app.use(express.json());

app.use("/api/v1",mainRouter);


// app.use("/api/v1/account",v2Router);

app.listen( 3000,  ()=> {
    console.log('Server is running on port 3000');
  });
