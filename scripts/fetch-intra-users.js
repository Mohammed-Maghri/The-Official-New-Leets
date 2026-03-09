#!/usr/bin/env ts-node
"use strict";
/**
 * Standalone script to fetch users from 42 Intra API
 *
 * Usage:
 *   ts-node fetch-intra-users.ts --type=student --campus=16 --year=2024 --output=students-2024.json
 *   ts-node fetch-intra-users.ts --type=pooler --campus=16 --pool-month=july --pool-year=2024 --output=poolers.json
 *   ts-node fetch-intra-users.ts --type=student --campus=16 --cursus=21 --active=true --output=students.json
 *
 * Options:
 *   --type         student|pooler (default: student)
 *   --campus       Campus ID (e.g., 16 for Khouribga, 21 for Bengrir)
 *   --year         Filter students by year (e.g., 2024) - fetches all pages
 *   --pool-month   For poolers: january, february, march, april, july, august, september, october
 *   --pool-year    For poolers: year of the pool (e.g., 2024) - fetches all pages
 *   --cursus       Cursus ID (default: 21 for 42cursus)
 *   --active       Filter active users only (default: true)
 *   --page         Page number to start from (default: 1)
 *   --page-size    Number of results per page (default: 100, max: 100)
 *   --output       Output file path (required)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
// Load environment variables - works with .env file if present
if (typeof require !== "undefined") {
    try {
        require("dotenv").config();
    }
    catch (_a) {
        // dotenv not available, environment variables must be set manually
    }
}
// Parse command-line arguments
function parseArgs() {
    var args = process.argv.slice(2);
    var options = {
        type: "student",
        campus: null,
        year: null,
        poolMonth: null,
        poolYear: null,
        cursus: 21,
        active: true,
        page: 1,
        pageSize: 100,
        output: "",
    };
    args.forEach(function (arg) {
        var _a = arg.replace("--", "").split("="), key = _a[0], value = _a[1];
        switch (key) {
            case "type":
                options.type = value;
                break;
            case "campus":
                options.campus = parseInt(value);
                break;
            case "year":
                options.year = parseInt(value);
                break;
            case "pool-month":
                options.poolMonth = value;
                break;
            case "pool-year":
                options.poolYear = parseInt(value);
                break;
            case "cursus":
                options.cursus = parseInt(value);
                break;
            case "active":
                options.active = value === "true";
                break;
            case "page":
                options.page = parseInt(value);
                break;
            case "page-size":
                options.pageSize = Math.min(parseInt(value), 100);
                break;
            case "output":
                options.output = value;
                break;
            case "help":
                showHelp();
                process.exit(0);
                break;
        }
    });
    return options;
}
function showHelp() {
    console.log("\n42 Intra Users Fetcher\n======================\n\nUsage:\n  ts-node fetch-intra-users.ts [options]\n\nOptions:\n  --type=<student|pooler>    Type of users to fetch (default: student)\n  --campus=<id>              Campus ID (required)\n  --year=<year>              Filter students by year (fetches all pages until empty)\n  --pool-month=<month>       For poolers: month name (e.g., july, august)\n  --pool-year=<year>         For poolers: year of the pool (fetches all pages until empty)\n  --cursus=<id>              Cursus ID (default: 21 for 42cursus)\n  --active=<true|false>      Filter active users only (default: true)\n  --page=<number>            Starting page number (default: 1)\n  --page-size=<number>       Results per page, max 100 (default: 100)\n  --output=<path>            Save results to JSON file (required)\n\nExamples:\n  # Fetch all students from 2024 in Khouribga (fetches until empty)\n  ts-node fetch-intra-users.ts --type=student --campus=16 --year=2024 --output=students-2024.json\n\n  # Fetch all July 2024 poolers from Bengrir (fetches until empty)\n  ts-node fetch-intra-users.ts --type=pooler --campus=21 --pool-month=july --pool-year=2024 --output=poolers-july-2024.json\n\n  # Fetch active students from Rabat\n  ts-node fetch-intra-users.ts --type=student --campus=75 --active=true --output=rabat-students.json\n\nCampus IDs:\n  Khouribga: 16, Bengrir: 21, Tetouan: 55, Rabat: 75\n  Paris: 1, Lyon: 9, Barcelona: 46, etc.\n\nEnvironment Variables Required:\n  INTRA_UID          - 42 API Client UID\n  INTRA_SECRET_KEY   - 42 API Client Secret\n  ");
}
// Get OAuth token from 42 API
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        var clientId, clientSecret, params, response, error, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clientId = process.env.INTRA_UID ||
                        "u-s4t2ud-65bf6a6fffb04abc606bb08a11a8ab7060a6ece2cd33bef8dfd36b801d0f29de";
                    clientSecret = process.env.INTRA_SECRET_KEY ||
                        "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";
                    if (!clientId || !clientSecret) {
                        throw new Error("Missing INTRA_UID or INTRA_SECRET_KEY in environment variables");
                    }
                    console.error("🔐 Requesting access token from 42 API...");
                    params = new URLSearchParams({
                        grant_type: "client_credentials",
                        client_id: clientId,
                        client_secret: clientSecret,
                    });
                    return [4 /*yield*/, fetch("https://api.intra.42.fr/oauth/token", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                            body: params.toString(),
                        })];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    error = _a.sent();
                    throw new Error("Failed to get access token: ".concat(response.status, " - ").concat(error));
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    console.error("✅ Access token obtained\n");
                    return [2 /*return*/, data.access_token];
            }
        });
    });
}
// Build API URL based on options
function buildApiUrl(options, page) {
    var baseUrl = "https://api.intra.42.fr/v2/campus";
    var filters = [];
    // Campus filter
    if (!options.campus) {
        throw new Error("Campus ID is required. Use --campus=<id>");
    }
    // Build URL: /v2/campus/:campus_id/users
    var url = "".concat(baseUrl, "/").concat(options.campus, "/users");
    // Filter out staff members (available filter for this endpoint)
    filters.push("filter[staff?]=false");
    // Filter out alumni if looking for active users
    if (options.active) {
        filters.push("filter[alumni?]=false");
    }
    // For students: filter by year if provided
    if (options.type === "student" && options.year) {
        // Filter by pool year (users who started in that year)
        filters.push("filter[pool_year]=".concat(options.year));
    }
    // For poolers: filter by pool month and year
    if (options.type === "pooler") {
        if (options.poolMonth) {
            filters.push("filter[pool_month]=".concat(options.poolMonth));
        }
        if (options.poolYear) {
            filters.push("filter[pool_year]=".concat(options.poolYear));
        }
    }
    // Pagination
    filters.push("page[number]=".concat(page));
    filters.push("page[size]=".concat(options.pageSize));
    // Sort by login
    filters.push("sort=login");
    return "".concat(url, "?").concat(filters.join("&"));
}
// Fetch users from 42 API
function fetchUsers(accessToken, options) {
    return __awaiter(this, void 0, void 0, function () {
        var allUsers, currentPage, hasMore, fetchAllPages, url, response, error, users;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allUsers = [];
                    currentPage = options.page;
                    hasMore = true;
                    fetchAllPages = options.year !== null || options.poolYear !== null;
                    console.error("\uD83D\uDCE5 Fetching ".concat(options.type, "s from campus ").concat(options.campus, "..."));
                    if (options.type === "pooler" && options.poolMonth && options.poolYear) {
                        console.error("   Pool: ".concat(options.poolMonth, " ").concat(options.poolYear));
                    }
                    if (options.year) {
                        console.error("   Year: ".concat(options.year));
                    }
                    if (fetchAllPages) {
                        console.error("   Mode: Fetching ALL pages until empty");
                    }
                    console.error("");
                    _a.label = 1;
                case 1:
                    if (!hasMore) return [3 /*break*/, 8];
                    url = buildApiUrl(options, currentPage);
                    console.error("\uD83D\uDCC4 Fetching page ".concat(currentPage, "..."));
                    return [4 /*yield*/, fetch(url, {
                            headers: {
                                Authorization: "Bearer ".concat(accessToken),
                                "Content-Type": "application/json",
                            },
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    error = _a.sent();
                    throw new Error("Failed to fetch users: ".concat(response.status, " - ").concat(error));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    users = _a.sent();
                    if (users.length === 0) {
                        console.error("   No more users found - reached end");
                        hasMore = false;
                        return [3 /*break*/, 8];
                    }
                    allUsers.push.apply(allUsers, users);
                    console.error("   Found ".concat(users.length, " users (total: ").concat(allUsers.length, ")"));
                    // Check if there might be more pages
                    if (users.length < options.pageSize) {
                        console.error("   Received less than page size - this is the last page");
                        hasMore = false;
                    }
                    currentPage++;
                    if (!hasMore) return [3 /*break*/, 7];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 1];
                case 8:
                    console.error("\n\u2705 Total users fetched: ".concat(allUsers.length, "\n"));
                    return [2 /*return*/, allUsers];
            }
        });
    });
}
// Filter users based on additional criteria
function filterUsers(users, options) {
    var filtered = users;
    // Filter out alumni if looking for active students
    if (options.active && options.type === "student") {
        var beforeCount = filtered.length;
        filtered = filtered.filter(function (user) { return !user["alumni?"]; });
        console.error("\uD83C\uDF93 Filtered out ".concat(beforeCount - filtered.length, " alumni"));
    }
    // Filter out staff
    var beforeStaffFilter = filtered.length;
    filtered = filtered.filter(function (user) { return !user["staff?"]; });
    console.error("\uD83D\uDC65 Filtered out ".concat(beforeStaffFilter - filtered.length, " staff members"));
    return filtered;
}
// Main function
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var options, accessToken, users, filteredUsers, output, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    options = parseArgs();
                    // Validate required output parameter
                    if (!options.output) {
                        console.error("❌ Error: --output parameter is required");
                        console.error("\nExample: ts-node fetch-intra-users.ts --campus=16 --year=2024 --output=users-2024.json");
                        console.error("\nRun with --help for more information");
                        process.exit(1);
                    }
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _a.sent();
                    return [4 /*yield*/, fetchUsers(accessToken, options)];
                case 2:
                    users = _a.sent();
                    filteredUsers = filterUsers(users, options);
                    output = {
                        metadata: {
                            fetched_at: new Date().toISOString(),
                            type: options.type,
                            campus_id: options.campus,
                            year: options.year,
                            pool_month: options.poolMonth,
                            pool_year: options.poolYear,
                            cursus_id: options.cursus,
                            total_count: filteredUsers.length,
                        },
                        users: filteredUsers.map(function (user) {
                            var _a;
                            return ({
                                id: user.id,
                                login: user.login,
                                email: user.email,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                url: user.url,
                                image_url: (_a = user.image) === null || _a === void 0 ? void 0 : _a.link,
                                staff: user["staff?"],
                                alumni: user["alumni?"],
                                active: user["active?"],
                                pool_month: user.pool_month,
                                pool_year: user.pool_year,
                                location: user.location,
                                wallet: user.wallet,
                                correction_point: user.correction_point,
                                created_at: user.created_at,
                                updated_at: user.updated_at,
                            });
                        }),
                    };
                    // Save results to JSON file
                    return [4 /*yield*/, fs.writeFile(options.output, JSON.stringify(output, null, 2), "utf-8")];
                case 3:
                    // Save results to JSON file
                    _a.sent();
                    console.error("\uD83D\uDCBE Results saved to: ".concat(options.output));
                    console.error("\n✨ Done!");
                    process.exit(0);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("\n❌ Error:", error_1 instanceof Error ? error_1.message : String(error_1));
                    console.error("\nRun with --help for usage information");
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the script
main();
