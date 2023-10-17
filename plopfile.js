import fs from "node:fs";
import path from "node:path";
import process from "node:process";

/**
 * Automatically determines the folder[`/.template/*`] to use according to the plop argument[`destinationpath`].<br>
 * Also, if the template folder contains `override.js`, load and execute it.<br>
 * Obtain `default export` and use it to determine template.
 */
export default function (
  plop,
) {
  plop.setGenerator("generate source", {
    description: "generate source from template",
    prompts: [
      {
        // for vscode-plugin[`SamKirkland.plop-templates`].
        type: "input",
        name: "destinationpath",
        message: "Template destination path:",
      },
      {
        when: function (prompt) {
          // If the template does not exist, Throw error and exit.
          const destNamespace = getNamespaceFromDestPath(prompt.destinationpath);
          console.warn(`\x1b[31m!\x1b[39m Auto selected: ${destNamespace}`);
          return true;
        },
        type: "input",
        name: "name",
        message: "file name:",
      },
      {
        when: function (prompt) {
          return [
            "src.components.ui",
          ].includes(getNamespaceFromDestPath(prompt.destinationpath));
        },
        type: "wrapTargetElement",
        name: "wrapTargetElement",
        message: "HTML element name:",
      },
    ],
    actions: (prompt) => {
      const destinationPath = prompt.destinationpath;
      const templateDirName = getNamespaceFromDestPath(destinationPath);
      if (!templateDirName) {
        return [];
      }

      const overrideJsPath = `.template/${templateDirName}/override.js`;
      const overrideArgs = {
        ...prompt,
        templateDirName,
      };
      const overrided
        = fs.existsSync(overrideJsPath)
          ? templateOverrideFnMap[templateDirName](overrideArgs)
          : overrideArgs;

      return [
        {
          type: "addMany",
          skipIfExists: true,
          destination: "{{destinationpath}}",
          base: `.template/${overrided.templateDirName}`,
          templateFiles: `.template/${overrided.templateDirName}/**/*.hbs`,
          speed: "slow",
        },
      ];
    },
  });
}

const templateRoot = ".template";
const pwd = process.cwd();
const templateList
  = fs.readdirSync(templateRoot)
    .map((namespace) => ({
      namespace,
      depth: namespace.split(".").length,
    }))
    .sort((prev, next) => next.depth - prev.depth);
const templateOverrideFnMap
  = (await Promise.all(
    templateList
      .map(async ({ namespace }) => {
        const jsPath = `${pwd}/${templateRoot}/${namespace}/override.js`;
        if (!fs.existsSync(jsPath)) return;
        const overrideFn = (await import(jsPath)).default;
        return [namespace, overrideFn];
      }),
  ))
    .filter((it) => it)
    .reduce((sum, [namespace, overrideFn]) => {
      Object.assign(sum, {
        [namespace]: overrideFn,
      });
      return sum;
    }, {});

const getNamespaceFromDestPath = (destinationPath) => {
  const relativeDestPath = path.relative(pwd, destinationPath);
  const destNamespace = relativeDestPath.split("/").join(".");

  const templateDirName
    = templateList
      .find((it) => destNamespace.startsWith(it.namespace))
      ?.namespace;

  if (!templateDirName) {
    throw Error(
      `template not found:\n  ${JSON.stringify({
        pwd,
        destinationPath,
        destNamespace,
      }, null, 2).replaceAll("\n", "\n  ")}`,
    );
  }

  return templateDirName;
};
