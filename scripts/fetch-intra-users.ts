#!/usr/bin/env ts-node

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

import * as fs from "fs/promises";

// Load environment variables - works with .env file if present
if (typeof require !== "undefined") {
  try {
    require("dotenv").config();
  } catch {
    // dotenv not available, environment variables must be set manually
  }
}

interface Options {
  type: "student" | "pooler";
  campus: number | null;
  year: number | null;
  poolMonth: string | null;
  poolYear: number | null;
  cursus: number;
  active: boolean;
  page: number;
  pageSize: number;
  output: string;
}

interface IntraUser {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  url: string;
  image?: {
    link: string;
    versions?: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
  "staff?": boolean;
  "alumni?": boolean;
  "active?": boolean;
  pool_month: string | null;
  pool_year: string | null;
  location: string | null;
  wallet: number;
  correction_point: number;
  created_at: string;
  updated_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
}

interface OutputUser {
  id: number;
  login: string;
  email: string;
  first_name: string;
  last_name: string;
  url: string;
  image_url?: string;
  staff: boolean;
  alumni: boolean;
  active: boolean;
  pool_month: string | null;
  pool_year: string | null;
  location: string | null;
  wallet: number;
  correction_point: number;
  created_at: string;
  updated_at: string;
}

interface OutputData {
  metadata: {
    fetched_at: string;
    type: string;
    campus_id: number;
    year: number | null;
    pool_month: string | null;
    pool_year: number | null;
    cursus_id: number;
    total_count: number;
  };
  users: OutputUser[];
}

// Parse command-line arguments
function parseArgs(): Options {
  const args = process.argv.slice(2);
  const options: Options = {
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

  args.forEach((arg) => {
    const [key, value] = arg.replace("--", "").split("=");

    switch (key) {
      case "type":
        options.type = value as "student" | "pooler";
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

function showHelp(): void {
  console.log(`
42 Intra Users Fetcher
======================

Usage:
  ts-node fetch-intra-users.ts [options]

Options:
  --type=<student|pooler>    Type of users to fetch (default: student)
  --campus=<id>              Campus ID (required)
  --year=<year>              Filter students by year (fetches all pages until empty)
  --pool-month=<month>       For poolers: month name (e.g., july, august)
  --pool-year=<year>         For poolers: year of the pool (fetches all pages until empty)
  --cursus=<id>              Cursus ID (default: 21 for 42cursus)
  --active=<true|false>      Filter active users only (default: true)
  --page=<number>            Starting page number (default: 1)
  --page-size=<number>       Results per page, max 100 (default: 100)
  --output=<path>            Save results to JSON file (required)

Examples:
  # Fetch all students from 2024 in Khouribga (fetches until empty)
  ts-node fetch-intra-users.ts --type=student --campus=16 --year=2024 --output=students-2024.json

  # Fetch all July 2024 poolers from Bengrir (fetches until empty)
  ts-node fetch-intra-users.ts --type=pooler --campus=21 --pool-month=july --pool-year=2024 --output=poolers-july-2024.json

  # Fetch active students from Rabat
  ts-node fetch-intra-users.ts --type=student --campus=75 --active=true --output=rabat-students.json

Campus IDs:
  Khouribga: 16, Bengrir: 21, Tetouan: 55, Rabat: 75
  Paris: 1, Lyon: 9, Barcelona: 46, etc.

Environment Variables Required:
  INTRA_UID          - 42 API Client UID
  INTRA_SECRET_KEY   - 42 API Client Secret
  `);
}

// Get OAuth token from 42 API
async function getAccessToken(): Promise<string> {
  // Hardcoded credentials - use environment variables in production
  const clientId = process.env.INTRA_UID || "int put";
  const clientSecret = process.env.INTRA_SECRET_KEY || "input";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing INTRA_UID or INTRA_SECRET_KEY in environment variables",
    );
  }

  console.error("🔐 Requesting access token from 42 API...");

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Failed to get access token: ${response.status} - ${error}`,
    );
  }

  const data: TokenResponse = await response.json();
  console.error("✅ Access token obtained\n");
  return data.access_token;
}

// Build API URL based on options
function buildApiUrl(options: Options, page: number): string {
  const baseUrl = "https://api.intra.42.fr/v2/campus";
  const filters: string[] = [];

  // Campus filter
  if (!options.campus) {
    throw new Error("Campus ID is required. Use --campus=<id>");
  }

  // Build URL: /v2/campus/:campus_id/users
  const url = `${baseUrl}/${options.campus}/users`;

  // Filter out staff members (available filter for this endpoint)
  filters.push("filter[staff?]=false");

  // Filter out alumni if looking for active users
  if (options.active) {
    filters.push("filter[alumni?]=false");
  }

  // For students: filter by year if provided
  if (options.type === "student" && options.year) {
    // Filter by pool year (users who started in that year)
    filters.push(`filter[pool_year]=${options.year}`);
  }

  // For poolers: filter by pool month and year
  if (options.type === "pooler") {
    if (options.poolMonth) {
      filters.push(`filter[pool_month]=${options.poolMonth}`);
    }
    if (options.poolYear) {
      filters.push(`filter[pool_year]=${options.poolYear}`);
    }
  }

  // Pagination
  filters.push(`page[number]=${page}`);
  filters.push(`page[size]=${options.pageSize}`);

  // Sort by login
  filters.push("sort=login");

  return `${url}?${filters.join("&")}`;
}

// Fetch users from 42 API
async function fetchUsers(
  accessToken: string,
  options: Options,
): Promise<IntraUser[]> {
  const allUsers: IntraUser[] = [];
  let currentPage = options.page;
  let hasMore = true;

  // When year or pool-year is specified, fetch all pages until empty
  const fetchAllPages = options.year !== null || options.poolYear !== null;

  console.error(
    `📥 Fetching ${options.type}s from campus ${options.campus}...`,
  );
  if (options.type === "pooler" && options.poolMonth && options.poolYear) {
    console.error(`   Pool: ${options.poolMonth} ${options.poolYear}`);
  }
  if (options.year) {
    console.error(`   Year: ${options.year}`);
  }
  if (fetchAllPages) {
    console.error(`   Mode: Fetching ALL pages until empty`);
  }
  console.error("");

  while (hasMore) {
    const url = buildApiUrl(options, currentPage);

    console.error(`📄 Fetching page ${currentPage}...`);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch users: ${response.status} - ${error}`);
    }

    const users: IntraUser[] = await response.json();

    if (users.length === 0) {
      console.error(`   No more users found - reached end`);
      hasMore = false;
      break;
    }

    allUsers.push(...users);
    console.error(`   Found ${users.length} users (total: ${allUsers.length})`);

    // Check if there might be more pages
    if (users.length < options.pageSize) {
      console.error(`   Received less than page size - this is the last page`);
      hasMore = false;
    }

    currentPage++;

    // Rate limiting: wait 1 second between requests to avoid hitting API limits
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.error(`\n✅ Total users fetched: ${allUsers.length}\n`);
  return allUsers;
}

// Filter users based on additional criteria
function filterUsers(users: IntraUser[], options: Options): IntraUser[] {
  let filtered = users;

  // Filter out alumni if looking for active students
  if (options.active && options.type === "student") {
    const beforeCount = filtered.length;
    filtered = filtered.filter((user) => !user["alumni?"]);
    console.error(`🎓 Filtered out ${beforeCount - filtered.length} alumni`);
  }

  // Filter out staff
  const beforeStaffFilter = filtered.length;
  filtered = filtered.filter((user) => !user["staff?"]);
  console.error(
    `👥 Filtered out ${beforeStaffFilter - filtered.length} staff members`,
  );

  return filtered;
}

// Main function
async function main(): Promise<void> {
  try {
    const options = parseArgs();

    // Validate required output parameter
    if (!options.output) {
      console.error("❌ Error: --output parameter is required");
      console.error(
        "\nExample: ts-node fetch-intra-users.ts --campus=16 --year=2024 --output=users-2024.json",
      );
      console.error("\nRun with --help for more information");
      process.exit(1);
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Fetch users
    const users = await fetchUsers(accessToken, options);

    // Filter users
    const filteredUsers = filterUsers(users, options);

    // Prepare output
    const output: OutputData = {
      metadata: {
        fetched_at: new Date().toISOString(),
        type: options.type,
        campus_id: options.campus!,
        year: options.year,
        pool_month: options.poolMonth,
        pool_year: options.poolYear,
        cursus_id: options.cursus,
        total_count: filteredUsers.length,
      },
      users: filteredUsers.map((user) => ({
        id: user.id,
        login: user.login,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        url: user.url,
        image_url: user.image?.link,
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
      })),
    };

    // Save results to JSON file
    await fs.writeFile(
      options.output,
      JSON.stringify(output, null, 2),
      "utf-8",
    );
    console.error(`💾 Results saved to: ${options.output}`);

    console.error("\n✨ Done!");
    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Error:",
      error instanceof Error ? error.message : String(error),
    );
    console.error("\nRun with --help for usage information");
    process.exit(1);
  }
}

// Run the script
main();
