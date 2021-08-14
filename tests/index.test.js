const app = require("../app");
var http = require("http");
const supertest = require("supertest");
const request = supertest(app);

const Joi = require("joi").extend(require("@joi/date"));
const db = require("../store/index");
const backup = db.backup();

// beforeEach(()=>{
//     //Restore db to initial state before every test.
//     backup.restore();
// })

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
      expect(typeof response.body.id).toBe("number")
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

describe("Returned Api should conform to joi schema", () => {
  it("Tags schema response should conform to joi schema", () => {
    const schema = Joi.object().keys({
      tag: Joi.string().required(),
      count: Joi.number().required(),
      articles: Joi.array().items(Joi.string()).required(),
      related_tags: Joi.array().items(Joi.string()).unique(), //Not compulsory
    });
  });
});
