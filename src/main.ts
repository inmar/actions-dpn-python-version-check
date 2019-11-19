import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as requests from 'request-promise-native';

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

      version = output;
    }

    if (!version) {
        throw new Error("Must specify version or use_package_version");
    }

    const resp = await requests.get(
      `https://${pypi_hostname}/api/package/dpn_events_python/`,
      {
        auth: {user: pypi_username, password: pypi_password},
        json: true
      }
    );

    for (var existing_package of resp.packages) {
      if (existing_package.version == version) {
        throw new Error("Version already exists in package server");
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
