// SPDX-FileCopyrightText: the secureCodeBox authors
//
// SPDX-License-Identifier: Apache-2.0

export async function parse(fileContent) {
  if (!fileContent) {
    return [];
  }

  const report = JSON.parse(fileContent);
  if (!report.results || report.results.length == 0) {
    return [];
  }

  const time = new Date(report.time).toISOString();
  return report.results.map((result) => ({
    name: "Webserver Content",
    description: `Content [${result.input ? Object.values(result.input) : ""}] was found on the webserver ${result.host}.`, // todo rn: what if no FUZZ keyword is used??
    identified_at: time,
    osi_layer: "APPLICATION",
    severity: "INFORMATIONAL",
    category: "Webserver Content",
    attributes: {
      httpStatus: result.status,
      length: result.length,
      words: result.words,
      lines: result.lines,
      contentType: result["content-type"],
      redirectlocation: result.redirectlocation,
      duration: result.duration,
      // resultFile = the name of the file containing the full request and response,
      // SCB does currently not implement saving the file (because data might be large)
      // resultFile: result.resultfile,
      hostname: result.host,
      input: result.input,
      // FUZZ keywords can also be in headers -> we should see that within the result
      postdata: report?.config?.postdata,
      // FUZZ keywords can also be in headers -> we should see that within the result
      headers: report?.config?.headers,
    },
    location: result.url,
  }));
}
