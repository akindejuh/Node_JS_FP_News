const { model, Schema } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
    },
    topic: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    author: {
      type: String,
    },
    published: {
      type: Date,
    },
    audienceScore: {
      type: Number,
    },
    summary: {
      type: String,
    },
    content: {
      type: String,
    },
  },
  { timestamps: true },
);

const News = model("News", schema, "news");

module.exports = News;
