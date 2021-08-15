const app = require("../app");
var http = require("http");
const supertest = require("supertest");
const request = supertest(app);

const Joi = require("joi").extend(require("@joi/date"));
const db = require("../store/index");
const backup = db.backup();

it("1 should equal 1", () => {
  expect(1).toBe(1);
});

describe("Endpoint reponses", () => {
  it("Return 404", async () => {
    const response = await request.get("/nonexistantapi");
    expect(response.status).toBe(404);
  });

  describe("GET Articles", () => {
    it("Return 200", async () => {
      const response = await request.get("/articles/1");
      expect(response.status).toBe(200);
    });

    it("Return 204", async () => {
      const response = await request.get("/articles/100000");
      expect(response.status).toBe(204);
    });

    it("Return 400", async () => {
      const response = await request.get("/articles/abc");
      expect(response.status).toBe(400);
    });
  });

  describe("GET tags", () => {
    it("Return 200", async () => {
      const response = await request.get("/tags/science/20160922");
      expect(response.status).toBe(200);
    });

    it("Return 204", async () => {
      const response = await request.get("/tags/jesttesting/20160922");
      expect(response.status).toBe(204);
    });

    it("Return 400", async () => {
      const response = await request.get("/tags/science/abc");
      expect(response.status).toBe(400);
    });
  });

  describe("POST Article", () => {
    afterEach(() => {
      //Restore db to initial state
      backup.restore();
    });

    it("Return 200", async () => {
      const body = {
        title:
          "latest science shows that potato chips are better for you than sugar",
        date: "2016-09-22",
        body: "some text, potentially containing simple markup about how potato chips are great",
        tags: ["health", "fitness", "science"],
      };
      const response = await request.post("/articles").send(body);
      expect(response.status).toBe(200);
      expect(typeof response.body.id).toBe("number");
    });

    it("Return 400 from missing data", async () => {
      const body = {
        date: "2016-09-22",
        body: "some text, potentially containing simple markup about how potato chips are great",
        tags: ["health", "fitness", "science"],
      };
      const response = await request.post("/articles").send(body);
      expect(response.status).toBe(400);
    });

    it("Return 400 from bad data", async () => {
      const body = {
        title:
          "latest science shows that potato chips are better for you than sugar",
        date: "2016-09-22",
        body: "some text, potentially containing simple markup about how potato chips are great",
        tags: "health",
      };
      const response = await request.post("/articles").send(body);
      expect(response.status).toBe(400);
    });

    it("Return 400 from bad data", async () => {
      const body = {
        title:
          "latest science shows that potato chips are better for you than sugar",
        date: "22-09-2016",
        body: "some text, potentially containing simple markup about how potato chips are great",
        tags: ["health", "fitness", "science"],
      };
      const response = await request.post("/articles").send(body);
      expect(response.status).toBe(400);
    });
  });
});

describe("Returned Api should conform to given joi schema", () => {
  it("Tags schema", async () => {
    const schema = Joi.object().keys({
      tag: Joi.string().required(),
      count: Joi.number().required(),
      articles: Joi.array().items(Joi.number()).required(),
      related_tags: Joi.array().items(Joi.string()).unique(), //Not compulsory
    });

    const response = await request.get("/tags/science/20160922");
    const m = schema.validate(response.body);
    expect(response.status).toBe(200);
    expect(m.error).toBe(undefined);
  });

  it("Articles schema", async () => {
    const schema = Joi.object().keys({
      id: Joi.number().required(),
      title: Joi.string().required(),
      date: Joi.date().format("YYYY-MM-DD").required(),
      body: Joi.string().required(),
      tags: Joi.array().items(Joi.string()).required(),
    });

    const response = await request.get("/articles/1");
    const m = schema.validate(response.body);
    expect(response.status).toBe(200);
    expect(m.error).toBe(undefined);
  });
});

describe("End to End", () => {
  it("POST and GET the same article and article should conform to schema", async () => {
    const schema = Joi.object().keys({
      id: Joi.number().required(),
      title: Joi.string().required(),
      date: Joi.date().format("YYYY-MM-DD").required(),
      body: Joi.string().required(),
      tags: Joi.array().items(Joi.string()).required(),
    });

    const body = {
      title: "This is a test for Jest Only",
      date: "2021-08-15",
      body: "POST and GET the same article and article should conform to schema",
      tags: ["testing", "science"],
    };
    const postResponse = await request.post("/articles").send(body);
    const { id = undefined } = postResponse.body;

    expect(id !== undefined).toBe(true);
    const expectedResult = { id, ...body };

    const getResponse = await request.get(`/articles/${id}`);
    expect(getResponse.status).toBe(200);

    const m = schema.validate(getResponse.body);

    expect(m.error).toBe(undefined);
    expect(getResponse.body).toEqual(expectedResult);
  });

  it("No duplicates for related tags", async ()=> {
    const entries = [
      {
        title: "This is a test for Jest Only",
        date: "2021-08-15",
        body: "POST and GET the same article and article should conform to schema",
        tags: ["testing", "science"],
      },
      {
        title: "This is a test for Jest Only",
        date: "2021-08-15",
        body: "POST and GET the same article and article should conform to schema",
        tags: ["testing", "science"],
      },
      {
        title: "This is a test for Jest Only",
        date: "2021-08-15",
        body: "POST and GET the same article and article should conform to schema",
        tags: ["testing", "science"],
      },
      {
        title: "This is a test for Jest Only",
        date: "2021-08-15",
        body: "POST and GET the same article and article should conform to schema",
        tags: ["testing", "science"],
      },
      {
        title: "This is a test for Jest Only",
        date: "2021-08-15",
        body: "POST and GET the same article and article should conform to schema",
        tags: ["testing", "science"],
      }
    ]


    entries.forEach(async entry=> {
      await request.post('/articles').send(entry)
    });

    const schema = Joi.object().keys({
      tag: Joi.string().required(),
      count: Joi.number().required(),
      articles: Joi.array().items(Joi.number()).required(),
      related_tags: Joi.array().items(Joi.string()).unique(), //Not compulsory
    });

    const response = await request.get('/tags/testing/20210815')
    console.log(response.body)
    const m = schema.validate(response.body)

    expect(m.error).toBe(undefined);


  })
});
