const { bootstrap, docker } = require("@kaholo/plugin-library");
const path = require("path");

const KAHOLO_POSTMAN_IMAGE = "postman/newman";

async function runPostmanTest(params) {
  const {
    workingDirectory,
    commands,
    environmentalVariables = {},
  } = params;

  const absoluteWorkingDir = path.resolve(workingDirectory);
  if (!await pathExists(absoluteWorkingDir)) {
    throw new Error(`Path ${workingDirectory} does not exist on agent!`);
  }

  let commandToExecute;
  // const postmanCommand = `node ${puppeteerJSFile}`;
  commandToExecute = docker.buildDockerCommand({
    image: KAHOLO_POSTMAN_IMAGE,
    command: docker.sanitizeCommand(commands),
    workingDirectory: "/etc/newman",
    environmentVariables: environmentalVariables,
    additionalArguments: [
      "-v",
      `${absoluteWorkingDir}:/etc/newman`,
    ],
  });

  const commandOutput = await exec(commandToExecute, {
    env: {
      ...process.env,
      ...environmentalVariables,
    },
  });

  if (commandOutput.stderr && !commandOutput.stdout && !puppeteerCaptureCommand) {
    throw new Error(commandOutput.stderr);
  } else if (commandOutput.stderr) {
    console.error(commandOutput.stderr);
  }

  return commandOutput.stdout;
}

async function hello(params) {
  const {
    helloName,
    saySecret,
    secret,
  } = params;

  let greeting = `Hello ${helloName}!`;

  if (saySecret && !secret) {
    throw new Error("No secret was provided to say. Please provide a secret or uncheck \"Say Secret\".");
  }

  if (saySecret) {
    greeting += `\nHere is the secret: ${secret}`;
  }

  return greeting;
}

module.exports = bootstrap({
  hello,
  runPostmanTest
});
