const Spa = require("../models/Spa");
const Masseuse = require("../models/Masseuse");
const { Sequelize } = require("sequelize");
const { getPagingData } = require("./commonFunction");
const { getPagination } = require("./commonFunction");
const elasticSearch = require("../helpher/elasticsearch");
const Op = Sequelize.Op;

exports.searchByMasseuseName = async (req, res) => {
  try {
    const { page, size, searchName } = req.params;
    const { limit, offset } = getPagination(page, size);
    console.log("Page and Size are");
    console.log(page);
    console.log(size);

    console.log("Limit and Offset are");
    console.log(limit);
    console.log(offset);
    // getSearchData(searchName).then(())

    const masseuseData = await Masseuse.findAll({
      // limit,
      // offset,
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + searchName + "%",
            },
          },
        ],
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("Masseuse is ", masseuseData);

    res.status(200).send({
      success: true,
      message: "Dats is",
      joinedData: masseuseData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.searchBySpaName = async (req, res) => {
  try {
    const { page, size, searchName } = req.params;
    const { limit, offset } = getPagination(page, size);
    console.log("Page and Size are");
    console.log(page);
    console.log(size);

    console.log("Limit and Offset are");
    console.log(limit);
    console.log(offset);
    // getSearchData(searchName).then(())

    const spaData = await Spa.findAll({
      // limit,
      // offset,
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + searchName + "%",
            },
          },
        ],
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    const masseuseData = await Masseuse.findAll({
      limit,
      offset,
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + searchName + "%",
            },
          },
        ],
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
      attributes: ["specialization", "services"],
    });
    console.log("Spa is ", spaData);
    console.log("Masseuse is ", masseuseData);

    res.status(200).send({
      success: true,
      message: "Dats is",
      joinedData: spaData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.searchAll = async (req, res) => {
  try {
    const { page, size, searchName } = req.params;
    const { limit, offset } = getPagination(page, size);
    console.log("Page and Size are");
    console.log(page);
    console.log(size);

    console.log("Limit and Offset are");
    console.log(limit);
    console.log(offset);

    const spaData = await Spa.findAll({
      // limit,
      // offset,
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + searchName + "%",
            },
          },
        ],
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("Spa is askjdsa ", spaData);

    const masseuseData = await Masseuse.findAll({
      // limit,
      // offset,
      where: {
        name: {
          [Op.like]: "%" + searchName + "%",
        },
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    const data = [spaData, masseuseData];

    const newData = spaData.concat(masseuseData);
    console.log("Concat is ");

    res.status(200).send({
      success: true,
      message: "Data is",
      joinedData: newData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.searchByElastic = async (req, res) => {
  try {
    //const { searchName } = req.body;
    //const { from, size, searchName } = req.params;
    const {
      from: fromParams,
      size: sizeParams,
      searchName: search,
      searchtype: sc,
    } = req.params;
    console.log("sc is ", sc);

    // console.log("Params are ", values);
    let data = await elasticSearch.searchName(
      fromParams,
      sizeParams,
      search,
      sc
    );
    // getSearchData(searchName).then(())

    res.status(200).send({
      success: true,
      message: "Dats is",
      joinedData: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

// exports.searchByElastic = async (req, res) => {
//   try {
//     //const { searchName } = req.body;
//     //const { from, size, searchName } = req.params;
//     const {
//       from: fromParams,
//       size: sizeParams,
//       searchName: search,
//     } = req.params;

//     // console.log("Params are ", values);
//     let data = await elasticSearch.searchName(fromParams, sizeParams, search);
//     // getSearchData(searchName).then(())

//     res.status(200).send({
//       success: true,
//       message: "Dats is",
//       joinedData: data,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//       code: 023,
//     });
//   }
// };

exports.searchByElasticForum = async (req, res) => {
  try {
    //const { searchName } = req.body;
    //const { from, size, searchName } = req.params;
    const {
      from: fromParams,
      size: sizeParams,
      searchName: search,
    } = req.params;

    // console.log("Params are ", values);
    let data = await elasticSearch.searchForum(fromParams, sizeParams, search);
    // getSearchData(searchName).then(())
    //console.log("payload data is ", data.hits.hits[0].payload);
    res.status(200).send({
      success: true,
      message: "Dats is",
      joinedData: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.getForms = async (req, res) => {
  try {
    //const { searchName } = req.body;
    //const { from, size, searchName } = req.params;
    const { from: fromParams, size: sizeParams } = req.params;

    // console.log("Params are ", values);
    let data = await elasticSearch.getAllForums(fromParams, sizeParams);
    // getSearchData(searchName).then(())
    //console.log("payload data is ", data.hits.hits[0].payload);
    res.status(200).send({
      success: true,
      message: "All documents are",
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.getAllSpaMasseuseForumFunc = async (req, res) => {
  try {
    //const { searchName } = req.body;
    //const { from, size, searchName } = req.params;
    const { from: fromParams, size: sizeParams, forumtype } = req.params;

    // console.log("Params are ", values);
    let data = await elasticSearch.getAllSpaMasseuseForum(
      forumtype,
      fromParams,
      sizeParams
    );
    // getSearchData(searchName).then(())
    //console.log("payload data is ", data.hits.hits[0].payload);
    res.status(200).send({
      success: true,
      message: "All documents are",
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.getAllSpaMasseuseFunc = async (req, res) => {
  try {
    //const { searchName } = req.body;
    //const { from, size, searchName } = req.params;
    const { from: fromParams, size: sizeParams, type } = req.params;

    console.log("Service type is ", type);

    // console.log("Params are ", values);
    let data = await elasticSearch.getAllSpaMasseuse(
      type,
      fromParams,
      sizeParams
    );
    // getSearchData(searchName).then(())
    //console.log("payload data is ", data.hits.hits[0].payload);
    res.status(200).send({
      success: true,
      message: "All documents are",
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

exports.searchForumSpaMasseuseRequest = async (req, res) => {
  try {
    //const { searchName } = req.body;
    //const { from, size, searchName } = req.params;
    const {
      from: fromParams,
      size: sizeParams,
      searchName: search,
    } = req.params;

    // console.log("Params are ", values);
    let data = await elasticSearch.searchForumsSpaMasseuse(
      fromParams,
      sizeParams,
      search
    );
    // getSearchData(searchName).then(())
    //console.log("payload data is ", data.hits.hits[0].payload);
    res.status(200).send({
      success: true,
      message: "Dats is",
      joinedData: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `try/catch err: ${err}`,
      success: false,
      code: 023,
    });
  }
};

// exports.searchAll = async (req, res) => {
//   try {
//     const { page, size, searchName } = req.params;
//     const { limit, offset } = getPagination(page, size);
//     console.log("Page and Size are");
//     console.log(page);
//     console.log(size);

//     console.log("Limit and Offset are");
//     console.log(limit);
//     console.log(offset);

//     const spaData = await Spa.findAndCountAll({
//       // limit,
//       // offset,
//       where: {
//         [Op.or]: [
//           {
//             name: {
//               [Op.like]: searchName + "%",
//             },
//           },
//         ],
//         isDeleted: false,
//       },
//       order: [["createdAt", "DESC"]],
//     });

//     console.log("Spa is askjdsa ", spaData);

//     const masseuseData = await Masseuse.findAndCountAll({
//       // limit,
//       // offset,
//       where: {
//         name: {
//           [Op.like]: searchName + "%",
//         },
//         isDeleted: false,
//       },
//       order: [["createdAt", "DESC"]],
//     });

//     const data = [spaData, masseuseData];

//     const newData = spaData.rows.concat(masseuseData.rows);
//     console.log("Concat is ");

//     res.status(200).send({
//       success: true,
//       message: "Data is",
//       joinedData: newData,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({
//       message: `try/catch err: ${err}`,
//       success: false,
//       code: 023,
//     });
//   }
// };
