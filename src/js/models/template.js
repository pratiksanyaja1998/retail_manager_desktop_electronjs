var TemplateModule = (function () {
  return {
    getTemplates: (callback) => {
      knex
        .select("*")
        .from("template")
        .then((result) => {
          callback(result);
        });
    },

    deleteTeplate: (id, callback) => {
      knex("template")
        .where("id", id)
        .del()
        .then((result) => {
          callback(result);
        });
    },

    insertTemplate: (template, callback) => {
      knex("template")
        .insert(template)
        .then((result) => {
          callback(result);
        });
    },
  };
})();

module.exports = TemplateModule;
