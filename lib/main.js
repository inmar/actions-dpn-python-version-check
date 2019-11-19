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
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const requests = __importStar(require("request-promise-native"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pypi_hostname = core.getInput("pypi_hostname");
            const pypi_username = core.getInput("pypi_username");
            const pypi_password = core.getInput("pypi_password");
            const package_name = core.getInput("package_name");
            const version = core.getInput("version");
            const resp = yield requests.get(`https://${pypi_hostname}/api/package/dpn_events_python/`, {
                auth: { user: pypi_username, password: pypi_password },
                json: true
            });
            for (var existing_package of resp.packages) {
                if (existing_package.version == version) {
                    core.setFailed("Version already exists in package server");
                    break;
                }
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
