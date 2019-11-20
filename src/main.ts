import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as requests from 'request-promise-native';
import * as util from 'util';

async function run() {
  try {
    const pypi_hostname: string = core.getInput("pypi_hostname");
    const pypi_username: string = core.getInput("pypi_username");
    const pypi_password: string = core.getInput("pypi_password");
    const package_name: string = core.getInput("package_name");

    const use_package_version: string = core.getInput("use_package_version");
    var version: string = core.getInput("version");

    if (use_package_version == "true") {
      var output: string = "";

      await exec.exec('python', ['setup.py', '--version'], {
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString();
          }
        }
      });

      version = output.trim();

      core.info(`Using version from setup.py: ${version}`);
    }

    if (!version) {
        throw new Error("Must specify version or use_package_version");
    }

    const request_options = {
        auth: {user: pypi_username, password: pypi_password},
        json: true
      };

    const url: string = `https://${pypi_hostname}/api/package/dpn_events_python/`;
    core.debug(`Fetching url: ${url}`);

    const resp = await requests.get(url, request_options);
    core.debug(`Response: ${JSON.stringify(resp)}`);

    for (const existing_package of resp.packages) {
      const existing_version: string = existing_package.version;

      core.debug(`Existing package: ${JSON.stringify(existing_package)}`);
      core.debug(`Existing version: ${existing_version}`);

      if (existing_version === version) {
        throw new Error("Version already exists in package server");
      }

      core.debug(`No match: ${util.inspect(existing_version)} vs ${util.inspect(version)}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
