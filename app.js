import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("strictQuery", true);

(async () => {
  try {
    await mongoose.connect('mongodb+srv://Maluda_Tech:Ugochi3203@todo-app.einoeqy.mongodb.net/todolistDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`CONNECTED TO MONGO!`);

    const itemSchema = new mongoose.Schema({
      name: {
        type: String
      }
    });
    const Item = mongoose.model("Item", itemSchema);

    const item1 = new Item({
      name: "Welcome to your todolist!"
    });
    const item2 = new Item({
      name: "Hit the + button to add a new item"
    });
    const item3 = new Item({
      name: "<-- Hit this to delete an item"
    });

    const defaultItems = [item1, item2, item3];

    const listSchema = new mongoose.Schema({
      name: String,
      items: [itemSchema]
    });

    const List = mongoose.model("List", listSchema);

    // Handle the dynamic routes outside of the app.get("/") handler
    app.get("/:customPageName", async (req, res) => {
      const customPageName = _.capitalize(req.params.customPageName);

      try {
        const foundList = await List.findOne({ name: customPageName }).exec();
        if (!foundList) {
          // Create a new list
          const list = new List({
            name: customPageName,
            items: defaultItems,
          });
          // Save the List document
          await list.save();
          console.log(`List with name ${customPageName} created.`);
          res.render("index.ejs", { listTitle: customPageName, listItems: defaultItems });
        } else {
          // Show an existing list
          res.render("index.ejs", { listTitle: foundList.name, listItems: foundList.items });
        }
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/", async (req, res) => {
      try {
        const items = await Item.find({});
        if (items.length === 0) {
          try {
            await Item.insertMany(defaultItems);
            console.log(`Default items inserted.`);
            res.redirect("/");
          } catch (insertError) {
            console.log("Error inserting default items:", insertError);
            res.render("index.ejs", { listTitle: "Today", listItems: [] });
          }
        } else {
          res.render("index.ejs", { listTitle: "Today", listItems: items });
        }
      } catch (error) {
        console.log("Error fetching items:", error);
        res.render("index.ejs", { listTitle: "Today", listItems: [] });
      }
    });

    app.post("/add", async (req, res) => {
      const newTodo = req.body.newTodo;
      const btnName =  req.body.newItem;
      const item = new Item({ name: newTodo });

      if (newTodo.trim() !== "") {
        if(btnName === "Today" ){
          await item.save();
          res.redirect("/");
        }else{
          const crossCheck = await List.findOne({name: btnName})
          crossCheck.items.push(item);
          crossCheck.save();
          res.redirect(`/${btnName}`)
        }
      };
    });

    app.post("/delete", async (req, res) => {
      const checkedItemId = req.body.checkbox;
      const listName = req.body.listName

      if(listName === "Today"){
        try {
          await Item.findByIdAndRemove(checkedItemId);
          console.log(`Item with ID ${checkedItemId} deleted.`);
        } catch (error) {
          console.log("Error deleting item:", error);
        }
        res.redirect("/");
      }else{
        try{
        await List.findOneAndUpdate(
        {name: listName},
        {$pull: {items: {_id: checkedItemId}}});
        res.redirect(`/${listName}`);
      }catch(err){
        console.log(`Error deleting listed items:${err}`)
      }
      }
    });

  } catch (error) {
    console.log(`OH NO! MONGO CONNECTION/QUERY ERROR!`);
    console.error(error);
  }
})();

app.listen(port, () => {
  console.log(`Server is up and running on Port: ${port}`);
});
