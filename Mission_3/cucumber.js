module.exports = {
  default: {
    require: ["steps/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress", "html:cucumber-report.html"],
    publishQuiet: true,
  },
};
