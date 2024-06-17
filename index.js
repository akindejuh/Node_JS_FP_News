const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const News = require("./model");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors("*"));

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.NODE_DATABASE_URL)
  .then(() => {
    app.listen(parseInt(process.env.PORT || 5000), () => {
      console.log(`FP_News Server is live.`);
    });
  })
  .catch((err) => {
    throw new Error(`MongoDB Connection Error -> ${err}`);
  });

const Paging = async (collection, query, pipeline, startPage, limit) => {
  const firstIndex = (startPage - 1) * limit;

  const [itemCount, items] = await Promise.all([
    collection.aggregate([{ $match: query }]).count("total_count"),
    collection.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      ...pipeline,
      { $skip: firstIndex },
      { $limit: limit },
    ]),
  ]);

  const total_page = Math.ceil(itemCount?.[0]?.total_count / limit) || 0;
  const current_page = startPage;
  const next_page = current_page < total_page ? current_page + 1 : 0;

  return {
    items,
    page: {
      total_page,
      current_page,
      next_page,
    },
  };
};

app.use("/news/:id", async (req, res) => {
  try {
    const result = await News.findById(req.params?.id || "");

    if (result) {
      res.status(200).json({
        ok: true,
        data: result.toObject(),
      });
    } else {
      res.status(400).json({
        ok: false,
        msg: "Invalid Request!",
      });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "This is on us. Our team is working to resolve this issue, thanks for your understanding.",
    });
  }
});

app.use("/news", async (req, res) => {
  try {
    const result = await Paging(
      News,
      { title: { $regex: req.query?.search || "", $options: "i" } },
      [{ $project: { _id: 1, title: 1, published: 1, topic: 1, imageUrl: 1, author: 1 } }],
      parseInt(req.query?.page) || 1,
      10,
    );

    res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "This is on us. Our team is working to resolve this issue, thanks for your understanding.",
    });
  }
});

app.use("/", (req, res) => {
  res.status(200).send("Welcome to FP News Server!");
});
