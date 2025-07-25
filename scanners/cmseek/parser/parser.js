// SPDX-FileCopyrightText: the secureCodeBox authors
//
// SPDX-License-Identifier: Apache-2.0

export async function parse(findings) {
  let results = [];
  // Making sure the CMS is Joomla
  if (findings.cms_id != "joom") {
    return results;
  }
  // Check if debug mode is enabled ; if yes add finding
  let parsed_debug_mode_enabled = [];

  // I ran into an issue where the time coverted to ISO String was dependant from the timezone of the machine running the test.
  // This means that if GitHub Actions CI time and local time are different the test will fail.
  // To fix this we need to enforce the timezone in the date string.
  // cmseek uses the timezone of the machine running the scan, so it will be different machine to machine (or cloud service).
  // https://github.com/Tuhinshubhra/CMSeeK/blob/ce085fee1b5f48db7412911e399bb2c771e73a0f/cmseekdb/basic.py#L296
  // For simplicity UTC time is enforced, and that is by adding a Z to the end of the date string.
  const last_scanned = new Date(findings.last_scanned + "Z").toISOString();
  if (findings.joomla_debug_mode == "enabled") {
    parsed_debug_mode_enabled = {
      name: "Debug mode",
      identified_at: last_scanned,
      description: `Debug mode is enabled on the site`,
      category: "Security Misconfiguration",
      location: findings.url,
      osi_layer: "APPLICATION",
      severity: "MEDIUM",
    };
  }

  // Check if backup files are open; if yes add finding
  let parsed_backupFiles = [];
  if ("joomla_backup_files" in findings) {
    parsed_backupFiles = {
      name: "Backup files",
      identified_at: last_scanned,
      description: `Visible Backup files found`,
      category: "Visible internal files",
      location: findings.url,
      osi_layer: "APPLICATION",
      severity: "INFORMATIONAL",
      attributes: {
        joomla_backup_files: findings.joomla_backup_files,
      },
    };
  }
  // Check if any core vulnerabilities exist; if yes list findings
  let parsed_vulnerabilities = [];
  if (findings.vulnerabilities_count > 0) {
    parsed_vulnerabilities = findings.vulnerabilities.map((vuln) => {
      // Fetch CVE from vulnerability references
      const cve = fetchCVE(vuln.references);
      const separator = " : ";

      // Create CVE reference object if CVE exists
      const cve_reference = cve
        ? [
            { type: "CVE", value: cve },
            { type: "URL", value: `https://www.cve.org/CVERecord?id=${cve}` },
          ]
        : []; // Empty array if no CVE exists

      // Create URL reference objects from the vulnerability references
      const urls_references = vuln.references
        .filter((ref) => ref.includes("http"))
        .map((ref) => ({
          type: "URL",
          // Extract the URL if the reference includes the separator, otherwise use the whole reference
          value: ref.includes(separator) ? ref.split(separator)[1].trim() : ref,
        }));

      // Combine URL and CVE references, and filter out any empty reference
      const references = [...urls_references, ...cve_reference].filter(
        (r) => r,
      );

      // Return the parsed vulnerability object
      return {
        name: vuln.name,
        identified_at: last_scanned,
        description: `Vulnerability of type ${vuln.name} found`,
        category: "Vulnerability",
        location: findings.url,
        osi_layer: "APPLICATION",
        severity: "HIGH",
        references: references.length > 0 ? references : null,
        attributes: {
          joomla_version: findings.joomla_version,
          references: vuln.references,
        },
      };
    });
  }
  // concat all parsed results
  return parsed_vulnerabilities
    .concat(parsed_backupFiles)
    .concat(parsed_debug_mode_enabled);
}
// Helper function to fetch CVE from references
// it is assumed that the reference is in the format "CVE : CVE-XXXX-XXXX"
function fetchCVE(references) {
  for (const reference of references) {
    if (reference.includes("CVE :")) {
      const cve = reference.split("CVE : ")[1].trim();
      return cve;
    }
  }
  return null;
}
