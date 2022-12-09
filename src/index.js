const pd = require("@pagerduty/pdjs");
const core = require("@actions/core");

async function run() {
  // parse action inputs
  const pdToken = core.getInput("token");
  const scheduleId = core.getInput("schedule-id");
  const startDate = core.getInput("start-date");
  const endDate = core.getInput("end-date");

  if (startDate && !endDate) {
    core.setFailed("An end date is required when a start date is passed in");
  }

  // set up API client
  const pdClient = pd.api({ token: pdToken });
  const url = `/schedules/${scheduleId}/users?since=${startDate}&until=${endDate}`
  core.info(`Url: ${url}`);

  pdClient
    .get(url)
    .then(({ resource }) => {
      core.info(`Resource: ${resource}`)
      // `resource` should be a list of oncall entries
      if (resource.length > 0) {
        core.debug(`Oncalls found: ${JSON.stringify(resource)}`);

        const person = resource[0]["user"]["summary"];

        if (typeof person !== "undefined") {
          core.info(`🎉 On-call person found: ${person}`);
          core.setOutput("person", person);
        } else {
          core.setFailed("❓ Could not parse on-call entry");
        }
      } else {
        core.setFailed("❓ No one is on the schedule");
      }
    })
    .catch((error) => {
      core.setFailed(error);
    });
}

run();
