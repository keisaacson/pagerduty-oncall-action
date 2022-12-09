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

  const requestOptions = {
    method: 'GET',
    headers: {
        "Accept": "application/vnd.pagerduty+json;version=2",
        "Content-Type": "application/json",
        "Authorization": "Token token=" + pdToken
        },
    redirect: 'follow'
  };

  var requestUrl = "https://api.pagerduty.com/schedules/" + scheduleId + "/users?since=" + startDate + "&until=" + endDate;
  core.info(`Url: ${requestUrl}`);
  fetch(requestUrl, requestOptions)
    .then(response => response.json())
    .then(result => {
      const person = result.users[0].name;
      core.info(`🎉 On-call person found: ${person}`);
      core.setOutput("person", person);
    })
    .catch(error => console.log('error', error));
}

run();
