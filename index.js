const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const port = process.env.PORT || 5000;

///middleware

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

//URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cvpyv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Main Async Function
async function run() {
  try {
    await client.connect();
    // console.log('Successfully Connected');
    const database = client.db("tripExpo");
    const blogCollection = database.collection("blogs");
    const reviewCollection = database.collection("reviews");
    const userCollection = database.collection("users");
    const tipsCollection = database.collection("tips");

    /*-------------------------------------------------------------------------------*\
  //////////////////////////////// All blogs \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
\*-------------------------------------------------------------------------------*/

    // POST API For All blogs
    app.post("/blogs", async (req, res) => {
      const blog = req.body;
      console.log(blog);
      const result = await blogCollection.insertOne(blog);
      console.log(result);
      res.json(result);
    });

    //Get All blogs API
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const blogs = await cursor.toArray();
      res.json(blogs);
    });

    //Get All blogs API By Pagination
    app.get("/blogspagination", async (req, res) => {
      const cursor = blogCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let blogs;
      const count = await cursor.count();
      if (page) {
        blogs = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        blogs = await cursor.toArray();
      }
      res.send({
        count,
        blogs,
      });
    });

    //Get Single blog
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Single blog", id);
      const query = { _id: ObjectId(id) };
      const blog = await blogCollection.findOne(query);
      res.json(blog);
    });

    //Approve Blog Status
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      console.log(updatedStatus);
      blogCollection
        .updateOne(filter, {
          $set: { blogStatus: updatedStatus },
        })
        .then((result) => {
          res.send(result);
          console.log(result);
        });
    });

    //Delete Single blog
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleted blog", id);
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      console.log("Deleted", result);
      res.json(result);
    });

    //Approved Filtered Blogs
    /* app.get("/blogs/:cost", async (req, res) => {
      const status = req.params.cost;
      console.log(cost);
      const filter = { blogCost: status };
      const cursor = blogCollection.find(filter);
      const blogs = await cursor.toArray();
      res.json(blogs);
    }); */

    //Top Rated Trip API
    app.get("/toptrip", async (req, res) => {
      // here always use a different api, don't put ex: the all blogs ('/blogs)
      let query = {};
      const rating = req.query.rating;
      
      if (rating) {
        query = { blogRating: rating };
      }
      const cursor = blogCollection.find(query);
      const blogs = await cursor.toArray();
      res.json(blogs);
      // console.log();
    });

    //Long Trip API
    app.get("/longtrip", async (req, res) => {
      // here always use a different api, don't put ex: the all blogs ('/blogs)
      let query = {};
      const category = req.query.category;
      
      if (category) {
        query = { blogCategory: category };
      }
      const cursor = blogCollection.find(query);
      const blogs = await cursor.toArray();
      res.json(blogs);
      // console.log();
    });

    /*-------------------------------------------------------------------------------*\
  //////////////////////////////// Users \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
\*-------------------------------------------------------------------------------*/

    //POST API For Users
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    //Get Users API
    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });

    //Upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    //Make Admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //Admin Verfication
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    /*-------------------------------------------------------------------------------*\
  //////////////////////////////// Reviews \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
\*-------------------------------------------------------------------------------*/

    //POST API For Reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      // console.log(review);
      const result = await reviewCollection.insertOne(review);
      // console.log(result);
      res.json(result);
    });

    //Get Reviews API
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    /*-------------------------------------------------------------------------------*\
  //////////////////////////////// Tips \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
\*-------------------------------------------------------------------------------*/

    //POST API For Tips
    app.post("/tips", async (req, res) => {
      const tip = req.body;
      // console.log(tip);
      const result = await tipsCollection.insertOne(tip);
      // console.log(result);
      res.json(result);
    });

    //Get Tips API
    app.get("/tips", async (req, res) => {
      const cursor = tipsCollection.find({});
      const tips = await cursor.toArray();
      res.json(tips);
    });

    //Get Single Tip
    app.get("/tips/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Single Tip", id);
      const query = { _id: ObjectId(id) };
      const tip = await tipsCollection.findOne(query);
      res.json(tip);
    });

    /////////////////////////////END of Async Function\\\\\\\\\\\\\\\\\\\\\\\\\
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//Test The Server Connection
app.get("/", (req, res) => {
  res.send("Running Trip Expo Server.");
});

app.listen(port, () => {
  console.log("Welcome to PORT", port);
});
