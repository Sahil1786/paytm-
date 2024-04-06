const express =require("express");
const { authMiddleware } = require("../middleware");
const {Account,User}=require("../db");
const { default: mongoose } = require('mongoose');

const router=express.Router();


router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});


// router.post("/transfer", authMiddleware,async(req,res)=>{
//     const session = await mongoose.startSession();

//     session.startTransaction();  //starting the transaction

//     const amount=req.body.amount;
//     const toSend=req.body.to    

//     const account = await Account.findOne({
//         userId: req.userId
//     }).session(session)

//     if(account.balance<amount){
//         await session.abortTransaction()  // ending the transaction
//     res.status(400)
//         .json({
//             msg: "Insufficient balance"
//         })

//         const receivingAccount = await Account.findOne({
//             userId: toSend
//         }).session(session)
//         if(!receivingAccount){
//             await session.abortTransaction(); 
//             return res.json({
//                 msg: "Invalid account"
//             })
//         }
    
//         await Account.updateOne({
//             userId: req.userId
//         },{
//             $inc: {
//                 balance: -amount
//             }
//         }).session(session)
        
//         await Account.updateOne({
//             userId: toSend
//         },{
//             $inc: {
//                 balance: amount
//             }
//         }).session(session)
    
//         // commiting the transaction
//         await session.commitTransaction();
    
//         res.json({
//             msg: "Transfer successful"
//         })
//     }

// })

router.post("/transfer",authMiddleware, async(req,res)=>{
    const session = await mongoose.startSession();

    session.startTransaction();  //starting the transaction
    
    const amount = req.body.amount
    const sendTo = req.body.to
    

    const account = await Account.findOne({
        userId: req.userId
    }).session(session)

return console.log(account); 

    if(account.balance < amount){
        await session.abortTransaction();  // ending the transaction
        return res.status(400).json({
            msg: "Insufficient balance"
        })
    }
    
    const receivingAccount = await Account.findOne({
        userId: sendTo
    }).session(session)

    if(!receivingAccount){
        await session.abortTransaction(); 
        return res.json({
            msg: "Invalid account"
        })
    }

    await Account.updateOne({
        userId: req.userId
    },{
        $inc: {
            balance: -amount
        }
    }).session(session)
    
    await Account.updateOne({
        userId: sendTo
    },{
        $inc: {
            balance: amount
        }
    }).session(session)

    // commiting the transaction
    await session.commitTransaction();

    res.json({
        msg: "Transfer successful"
    })

})














module.exports = router;