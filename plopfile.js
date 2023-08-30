export default function (
  /** @type {import('plop').NodePlopAPI} */
  plop
) {
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
    actions: [
      {
        type: "addMany",
        destination: "{{destinationpath}}",
        base: ".template/components",
        templateFiles: ".template/components/**/*.hbs",
      },
    ],
  });
}
