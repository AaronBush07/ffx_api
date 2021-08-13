const express = require("express");
const router = express.Router();
const validate = require("../schema");
const Joi = require("joi").extend(require("@joi/date"));
const db = require("../store/db");
const { format } = require("date-fns");

/* GET home page. */
router.post("/articles", async function (req, res, next) {
  //console.log(req)
  const { body } = req;
  if (body) {
    console.log(body);
    const m = await validate(body);
    console.log(m);
    if (m.error) {
      const errMessages = m.error.details.map((v) => v.message);
      return res.status(400).send(errMessages);
    }

    try {
      //m.value.date = format(m.value.date, 'yyyy-MM-dd')
      await db.insertArticle(m.value);
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(500).send(e.message);
    }
  } else {
    res.status(400).send("Bad Request");
  }
});

router.get("/articles/:id", function (req, res, next) {
  try {
    Joi.assert(req.params.id, Joi.number());
    const result = db.getArticle(req.params.id);
    if (result) {
      result.date = format(new Date(result.date), "yyyy-MM-dd");
      res.status(200).send(result);
    } else {
      res.status(204).send();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.get("/tags/:tagName/:date", async function (req, res, next) {
  try {
    const schema = Joi.object().keys({
      tagName: Joi.string(),
      date: Joi.date().format("YYYYMMDD"),
    });
    const { tagName, date } = req.params;
    const m = await schema.validate({ tagName, date }, { abortEarly: false });

    /**Apologies for the date slice */
    const result = await db.getTags(
      tagName,
      date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8)
    );
    if (result && result.length > 0) {
      const relatedTags = {};
      const articles = result.map((v) => {
        v.tags.forEach((t) => {
          if (t !== tagName) relatedTags[t] = "exists";
        });
        return v.id;
      });
      
      const final = {
        tag: tagName,
        count: result.length,
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
