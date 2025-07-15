// SPDX-FileCopyrightText: the secureCodeBox authors
//
// SPDX-License-Identifier: Apache-2.0

import { scan } from "../../../tests/integration/helpers.js";

test(
  "localhost port scan should only find a host finding",
  async () => {
    const { categories, severities, count } = await scan(
      "nmap-localhost",
      "nmap",
      ["localhost"],
      90,
    );

    expect(count).toBe(1);
    expect(categories).toMatchInlineSnapshot(`
      {
        "Host": 1,
      }
    `);
    expect(severities).toMatchInlineSnapshot(`
      {
        "informational": 1,
      }
    `);
  },
  {
    timeout: 3 * 60 * 1000,
  },
);

test(
  "invalid port scan should be marked as errored",
  async () => {
    await expect(
      scan("nmap-localhost", "nmap", ["-invalidFlag", "localhost"], 90),
    ).rejects.toThrow(
      'Scan failed with description "Failed to run the Scan Container, check k8s Job and its logs for more details"',
    );
  },
  {
    timeout: 3 * 60 * 1000,
  },
);
