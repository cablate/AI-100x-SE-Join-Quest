module.exports = {
  default: {
    require: ["features/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress", "html:cucumber-report.html"],
  },
};
