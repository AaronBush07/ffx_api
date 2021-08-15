const express = require("express");
const router = express.Router();
const validate = require("../schema");
const Joi = require("joi").extend(require("@joi/date"));
const db = require("../store/db");
const { format } = require("date-fns");

/* POST Articles */
router.post("/articles", async function (req, res, next) {
  const { body } = req;
  if (body) {
    const m = await validate(body);
    if (m.error) {
      const errMessages = m.error.details.map((v) => v.message);
      return res.status(400).send(errMessages);
    }
    try {
      const id = db.insertArticle(body);
      res.status(200).send(id);
    } catch (e) {
      //console.log(e);
      res.status(500).send(e.message);
    }
  } else {
    res.status(400).send("Bad Request");
  }
});

/**GET articles by id */
router.get("/articles/:id", function (req, res, next) {
  try {
    try {
      Joi.assert(req.params.id, Joi.number());
    } catch (e) {
      res.status(400).send(e);
    }
    const result = db.getArticle(req.params.id);
    if (result) {
      result.date = format(new Date(result.date), "yyyy-MM-dd");
      res.status(200).send(result);
    } else {
      res.status(204).send();
    }
  } catch (e) {
    //console.log(e);
    res.status(500).send(e);
  }
});

/**GET tags by name and date */
router.get("/tags/:tagName/:date", async function (req, res, next) {
  try {
    const schema = Joi.object().keys({
      tagName: Joi.string(),
      date: Joi.date().format("YYYYMMDD"),
    });
    const { tagName, date } = req.params;
    const m = await schema.validate({ tagName, date }, { abortEarly: false });

    if (m.error) {
      const errMessages = m.error.details.map((v) => v.message);
      return res.status(400).send(errMessages);
    }
    /**Apologies for the date slice */
    const formattedDate = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8)
    const result = db.getTags(
      tagName,
      formattedDate
    );
    if (result && result.length > 0) {
      const rowCount = db.getRowCount(tagName, formattedDate);
      const relatedTags = {};
      const articles = result
        .map((v) => {
          v.tags.forEach((t) => {
            if (t !== tagName) relatedTags[t] = "exists";
          });
          return String(v.id);
        })
        .sort((a,b)=>{
          return Number(a) > Number(b)
        });

      const final = {
        tag: tagName,
        count: rowCount,
        articles,
        related_tags: Object.keys(relatedTags),
      };
      res.status(200).send(final);
    } else {
      res.status(204).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

module.exports = router;
