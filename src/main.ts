import * as core from '@actions/core';
import {wait} from './wait'
import * as requests from 'request-promise-native';

async function run() {
  try {
    const pypi_hostname: string = core.getInput("pypi_hostname");
    const pypi_username: string = core.getInput("pypi_username");
    const pypi_password: string = core.getInput("pypi_password");
    const package_name: string = core.getInput("package_name");
    const version: string = core.getInput("version");

    const resp = await requests.get(
      `https://${pypi_hostname}/api/package/dpn_events_python/`,
      {
        auth: {user: pypi_username, password: pypi_password},
        json: true
      }
    );

    for (var existing_package of resp.packages) {
      if (existing_package.version == version) {
        core.setFailed("Version already exists in package server");
        break
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
