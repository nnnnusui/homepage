/* eslint-disable @typescript-eslint/no-var-requires */
const { globSync } = require("glob");
const templateRoot = ".template";

module.exports = (
  /** @type {import('plop').NodePlopAPI} */
  plop
) => {
  plop.setGenerator("component", {
    description: "solidjs component",
    prompts: [
      {
        // for vscode-plugin[`SamKirkland.plop-templates`].
        type: "input",
        name: "destinationpath",
        message: "Template destination path:",
      },
      {
        type: "input",
        name: "name",
        message: "Component name:",
      },
    ],
    actions: (prompt) => {
      const dest = `${prompt.destinationpath}/${prompt.name}`;
      const src = `${templateRoot}/component`;
      return globSync("**/*", { cwd: src })
        .map((path) => ({
          type: "add",
          path: `${dest}/${path}`,
          templateFile: `${src}/${path}`,
        }));
    },
  });
};
