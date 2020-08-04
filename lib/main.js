"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const requests = __importStar(require("request-promise-native"));
const util = __importStar(require("util"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pypi_hostname = core.getInput("pypi_hostname");
            const pypi_username = core.getInput("pypi_username");
            const pypi_password = core.getInput("pypi_password");
            const package_name = core.getInput("package_name");
            const package_directory = core.getInput("package_directory");
            const use_package_version = core.getInput("use_package_version");
            var version = core.getInput("version");
            if (use_package_version == "true") {
                var output = "";
                var setup_py = package_directory.replace(/\/+$/g, '') + '/setup.py';
                yield exec.exec('python', [setup_py, '--version'], {
                    listeners: {
                        stdout: (data) => {
                            output += data.toString();
                        }
                    }
                });
                version = output.trim();
                core.info(`Using version from ${setup_py}: ${version}`);
            }
            if (!version) {
                throw new Error("Must specify version or use_package_version");
            }
            const request_options = {
                auth: { user: pypi_username, password: pypi_password },
                json: true
            };
            const url = `https://${pypi_hostname}/api/package/${package_name}/`;
            core.debug(`Fetching url: ${url}`);
            const resp = yield requests.get(url, request_options);
            core.debug(`Response: ${JSON.stringify(resp)}`);
            for (const existing_package of resp.packages) {
                const existing_version = existing_package.version;
                core.debug(`Existing package: ${JSON.stringify(existing_package)}`);
                core.debug(`Existing version: ${existing_version}`);
                if (existing_version === version) {
                    throw new Error("Version already exists in package server");
                }
                core.debug(`No match: ${util.inspect(existing_version)} vs ${util.inspect(version)}`);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
