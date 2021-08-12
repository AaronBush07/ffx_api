const express = require('express');
const router = express.Router();
const validate = require('../schema')
const db = require('../store/db')

/* GET home page. */
router.post('/articles', async function(req, res, next) {
  //console.log(req)
  const { body } = req
  if (body) {
    console.log(body)
    const m = await validate(body)
    console.log(m)
    if (m.error) {
      const errMessages = m.error.details.map(v=>v.message)
      return res.status(400).send(errMessages)
    }
    
    try {
      await db.insertArticle(m.value)
      res.status(200).send()
    } catch (e) {
      console.log(e)
      res.status(500).send(e.message)
    }


  } else {
    res.status(400).send("Bad Request")
  }
  
});

module.exports = router;
