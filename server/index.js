const express=require('express');
const cors=require('cors');
const monk=require('monk');
const Filter=require('bad-words');
const rateLimit=require('express-rate-limit');
const ObjectId = require("mongodb").ObjectID;
const MONGO_URI="mongodb+srv://dbadmin:<RsFCbiXK_.jb$8Z>@mycluster-zeh1p.gcp.mongodb.net/test?retryWrites=true&w=majority"
    

const app=express();

const db=monk(process.env.MONGO_URI || 'localhost/tweetbook');

const tweets=db.get('tweets');
const filter=new Filter();


app.use(cors());
app.use(express.json());


app.get('/',(req,res)=>{
    res.json({
        message:'twitter'
    });

});

app.get('/tweets',(req,res)=>{
    tweets
        .find()
        .then(tweets=>{
            res.json(tweets);
        });
})

function isvalidTweet(tweet){
    return tweet.name && tweet.name.toString().trim() !=='' &&
        tweet.content && tweet.content.toString().trim()!=='';
}

app.use(rateLimit({
    windowMs:20*1000,//10 seconds
    max:1//limit each IP to 1 requests per widowMs
}));

app.post('/tweets',(req,res)=>{
    if(isvalidTweet(req.body)){
        //insert into db...
        const tweet={
            name:filter.clean(req.body.name.toString()),
            content:filter.clean(req.body.content.toString()),
            created:new Date()

        };

        tweets
            .insert(tweet)
            .then(createdTweet=>{
                res.json(createdTweet);
            });
    }
    else{
        res.status(422);
        res.json({
            message:'hey! Name and content are required!'
        });
    }
    
});


app.listen(5000,()=>{
    console.log('Listening on http://localhost:5000');
});