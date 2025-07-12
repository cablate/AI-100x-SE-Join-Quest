module.exports = {
  default: {
    require: ["steps/**/*.ts", "e2e-tests/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress", "html:cucumber-report.html"],
  },
};
