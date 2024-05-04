const {JWT_SECRET}=require("../config")

const express =require("express");
const router =express.Router();
const z =require("zod");
const { User, Account } = require("../db");

const jwt = require("jsonwebtoken");
// const { JWT_SECRET } = require("../config.js");



const  { authMiddleware } = require("../middleware");

const signupBody = z.object({
   username:  z.string().email(),
   firstName: z.string(),
   lastName: z.string(),
   password : z.string()
})

router.get("/test", (req,res)=>{
    console.log(JWT_SECRET);
    res.send("ironman");
})

router.post("/signup", async (req, res) => {
    const  success  = signupBody.safeParse(req.body);
    console.log(success);
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;

   const re= await Account.create({
        userId,
        balance:1 + Math.random()*10000
    })

    console.log("--->",re);



    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})



const signinBody = z.object({
    username: z.string().email(),
	password: z.string()
})

router.post("/signin", async (req, res) => {
    const success  = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
  
        res.json({
            token: token
        })
        return;
    }

    
    res.status(411).json({
        message: "Error while logging in"
    })
})


const updateBody = z.object({
	password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})
router.put("/", authMiddleware, async(req,res)=>{
    const success = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    const userId = req.userId;

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    try {
        const user = await User.findOneAndUpdate(
            {
                _id : userId
            },
            {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    password: password
                },
            },
            {
                //using new: true return new obeject updating value
                new: true    //by default findoneAndUpdate() return the document as before update was applied
              
            }
        )  
        console.log(user);
        res.status(200).json({
            msg:"User updated successfully!"
        })  
        
    } catch (error) {
        console.log(error);
        res.status(411).json({
            msg: "Error whhile updating information"
        })
    }
   
})

router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";

    const users = await User.find({
        _id: {
            $ne: req.userId
        },
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user=>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})


module.exports=router;