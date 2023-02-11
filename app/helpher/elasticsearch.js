var client = require("../../config/elasticSearchConn");

var fs = require("fs");

async function searchName(fromP, sizeP, search, searchtype) {
  try {
    //console.log("Search Params are ", values);
    console.log("search word is ", search);
    console.log("Search type is ", searchtype);
    let result;
    if (searchtype == "all") {
      result = await client.search({
        index: "bodyslide",
        from: fromP,
        size: sizeP,
        body: {
          query: {
            multi_match: {
              query: search,
              fields: [
                "payload.service.name",
                "payload.service.services",
                "payload.service.specialization",
                // "payload.email",
                // "payload.city",
              ],
            },
          },
        },
      });
    } else if (searchtype == "Spa") {
      result = await client.search({
        index: "bodyslide",
        from: fromP,
        size: sizeP,
        body: {
          query: {
            bool: {
              must: [{ match: { "payload.type": searchtype } }],
              should: [
                { match: { "payload.service.services": search } },
                { match: { "payload.service.name": search } },
              ],
              minimum_should_match: 1,
            },
          },
        },
      });
    } else if (searchtype == "Masseuse") {
      result = await client.search({
        index: "bodyslide",
        from: fromP,
        size: sizeP,
        body: {
          query: {
            bool: {
              must: [{ match: { "payload.type": searchtype } }],
              should: [
                { match: { "payload.service.specialization": search } },
                { match: { "payload.service.name": search } },
              ],
              minimum_should_match: 1,
            },
          },
        },
      });
    } else {
      throw new Error("Elastic Search search property error ", err);
    }

    console.log("RESPONSE IS ", result);
    console.log("type RESPONSE IS ", typeof result);
    return result;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search search property error ", err);
  }
}

async function addProperty(tdata, payload) {
  try {
    console.log("IN CREATE =========================================");
    //console.log("Payload id is ", payload.id);
    let typeData = tdata;
    console.log("New id is ", typeData);
    console.log("Payload is ", payload);
    const bulkResponse = await client.index({
      index: "bodyslide",
      id: typeData,
      document: {
        payload,
      },
    });
    const count = await client.count({ index: "bodyslide" });
    console.log("COUNT IS ", count);
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search add property error ", err);
  }
}

async function updateProperty(tdata, data) {
  try {
    console.log("IN CREATE =========================================");
    //console.log("Payload id is ", comment.forumId);
    let typeData = tdata;
    console.log("New id is ", typeData);
    const bulkResponse = await client.update({
      index: "bodyslide",
      id: typeData,
      body: {
        doc: {
          payload: {
            services: data,
          },
        },
      },
    });
    const count = await client.count({ index: "bodyslide" });
    console.log("COUNT IS ", count);
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search add Forum error ", err);
  }
}

async function getAllSpaMasseuse(search, fromP, sizeP) {
  try {
    //console.log("forum type is ", search);
    //console.log("Search Params are ", values);
    //console.log("type of from ", search);
    console.log("In Type is ", search);
    let result;
    if (search == "all") {
      console.log("1");
      result = await client.search({
        index: "bodyslide",
        from: fromP,
        size: sizeP,
        body: {
          query: {
            match_all: {},
            // term: {
            //   "payload.service.name": {
            //     value: "wahab",
            //   },
            // },
          },
        },
      });
    } else if (search) {
      console.log("2");
      result = await client.search({
        index: "bodyslide",
        from: fromP,
        size: sizeP,
        body: {
          query: {
            // match_all: {},
            match: {
              "payload.type": search,
            },
            // term: {
            //   "payload.type": {
            //     value: "Spa",
            //   },
            // },
          },
        },
      });
    } else {
      throw new Error("invalid search type ", err);
    }

    console.log("RESPONSE IS ", result);
    console.log("type RESPONSE IS ", typeof result);
    return result;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search search property error ", err);
  }
}

async function updateSpaMasseuse(tdata, data, comment) {
  try {
    console.log("IN CREATE =========================================");
    //console.log("Payload id is ", comment.forumId);
    let typeData = tdata;
    console.log("New id is ", typeData);
    const bulkResponse = await client.update({
      index: "bodyslide",
      id: typeData,
      body: {
        doc: {
          payload: {
            masseuse: data,
          },
        },
      },
    });
    const count = await client.count({ index: "bodyslide" });
    console.log("COUNT IS ", count);
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search update spa masseuse error ", err);
  }
}

async function addForum(tdata, payload) {
  try {
    console.log("IN CREATE =========================================");
    console.log("Payload id is ", payload.masseuse.id);
    let typeData = tdata;
    console.log("New id is ", typeData);
    const bulkResponse = await client.index({
      index: "forum",
      id: typeData,
      document: {
        payload,
      },
    });
    const count = await client.count({ index: "forum" });
    console.log("COUNT IS ", count);
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search add Forum error ", err);
  }
}

async function updateForum(tdata, forum, comment) {
  try {
    console.log("IN CREATE =========================================");
    //console.log("Payload id is ", comment.forumId);
    let typeData = tdata;
    console.log("New id is ", typeData);
    const bulkResponse = await client.update({
      index: "forum",
      id: typeData,
      body: {
        doc: {
          payload: {
            masseuse: forum,
            comments: comment,
          },
        },
      },
    });
    const count = await client.count({ index: "forum" });
    console.log("COUNT IS ", count);
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search add Forum error ", err);
  }
}

async function searchForum(fromP, sizeP, search) {
  try {
    //console.log("Search Params are ", values);
    console.log("type of from ", search);
    const result = await client.search({
      index: "forum",
      from: fromP,
      size: sizeP,
      body: {
        query: {
          term: {
            "payload.masseuse.topic": {
              value: search,
            },
          },
        },
        sort: [{ "payload.masseuse.no_comments": "desc" }],

        // query: {
        //   match: {
        //     "payload.masseuse.topic": {
        //       minimum_should_match: search,
        //       operator: "AND",
        //       query: search,
        //     },
        //   },
        // },

        // query: {
        //   // match: { "payload.masseuse.topic": search },
        //   bool: {
        //     must: {
        //       match_phrase: {
        //         ["payload.masseuse.topic"]: search,
        //       },
        //     },
        //   },
        // },
      },
    });

    console.log("RESPONSE IS ", result);
    console.log("type RESPONSE IS ", typeof result);
    return result;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search search property error ", err);
  }
}

async function getAllForums(fromP, sizeP) {
  try {
    //console.log("forum type is ", search);
    //console.log("Search Params are ", values);
    //console.log("type of from ", search);
    const result = await client.search({
      index: "forum",
      from: fromP,
      size: sizeP,
      body: {
        query: {
          match_all: {},
        },
        // query: {
        //   term: {
        //     "payload.forumtype": search,
        //   },
        // },
        sort: [{ "payload.masseuse.no_comments": "desc" }],
      },
    });

    console.log("RESPONSE IS ", result);
    console.log("type RESPONSE IS ", typeof result);
    return result;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search search property error ", err);
  }
}

async function getAllSpaMasseuseForum(search, fromP, sizeP) {
  try {
    console.log("forum type is ", search);
    //console.log("Search Params are ", values);
    //console.log("type of from ", search);
    const result = await client.search({
      index: "forum",
      from: fromP,
      size: sizeP,
      body: {
        // query: {
        //   match_all: {},
        // },
        query: {
          match: {
            "payload.forumtype": search,
          },
        },
        sort: [{ "payload.masseuse.no_comments": "desc" }],
      },
    });

    console.log("RESPONSE IS ", result);
    console.log("type RESPONSE IS ", typeof result);
    return result;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search search property error ", err);
  }
}

async function searchForumsSpaMasseuse(fromP, sizeP, search) {
  try {
    console.log("sadas ", search);
    console.log("sadas ", fromP);
    const result = await client.msearch({
      body: [
        { index: "forum" },
        {
          query: {
            term: {
              "payload.masseuse.topic": {
                value: search,
              },
            },
          },
          sort: [{ "payload.masseuse.no_comments": "desc" }],
          from: fromP,
          size: sizeP,
        },
        { index: "bodyslide" },
        {
          query: {
            multi_match: {
              query: search,
              fields: [
                "payload.service.name",
                "payload.service.services",
                "payload.service.specialization",
                // "payload.email",
                // "payload.city",
              ],
            },
          },
          from: fromP,
          size: sizeP,
        },
      ],
    });
    console.log("RESPONSE IS ", result);
    console.log("type RESPONSE IS ", typeof result);
    return result;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search search property error ", err);
  }
}

async function deleteForum(forumID) {
  try {
    console.log("Deleted id is ", forumID);
    const deleteQuery = await client.deleteByQuery({
      index: "forum",

      conflicts: "proceed",
      query: {
        term: {
          _id: forumID,
        },
      },
    });
    console.log("Deleted forum is ", deleteQuery);
    let obj = {
      deleteQuery,
      forumID,
    };
    return obj;
  } catch (err) {
    console.log("error", err);
    // res.status(503).send({ success: false, message: "Server Error." });
    throw new Error("Elastic Search delete Forum error ", err);
  }
}
// client.msearch({
//   body: [
//       { _index: "abc", type: "abc"},
//       {
//           query : {
//               multi_match: {
//                   query: q,
//                   type: "cross_fields",
//                   analyzer: "ac_search_analyzer",
//                   operator: op,
//                   fields: ["a^4", "b^4", "c^2", "d", "e"]
//               }
//           },
//           size : 5,
//           _source : ["a", "b", "c"]
//       },
//       { _index: "xyz", type: "xyz"},
//       {
//           query : {
//               multi_match: {
//                   query: q,
//                   type: "cross_fields",
//                   analyzer: "ac_search_analyzer",
//                   operator: op,
//                   fields: ["a^4", "b^4", "c^2", "d", "e"]
//               }
//           },
//           size : 5,
//           _source : ["a", "b", "c"]
//       }
//   ],
// }).then(function (resp) {
// console.log(resp);
// });

module.exports = {
  addProperty,
  updateProperty,
  updateSpaMasseuse,
  searchName,
  getAllSpaMasseuse,
  addForum,
  updateForum,
  deleteForum,
  searchForum,
  getAllForums,
  getAllSpaMasseuseForum,
  searchForumsSpaMasseuse,
};
