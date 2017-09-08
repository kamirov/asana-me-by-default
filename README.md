# Me by Default (for Asana)

Small express app that uses Asana webhooks to automatically assign tasks you create to yourself.

I admit this was just an excuse to play with express and webhooks.

## Configuration

1. Run `cp config.example.js config.js` to create a config file.
1. Fill in `PERSONAL_ACCESS_TOKEN` in the config file. 
    - To get an Asana Personal Access Token, log in to your Asana account, click on "My Profile Settings" » "Apps" » "Manage Developer Apps" » "+ Create New Personal Access Token". Fill in any description, then copy and paste this token into the config file (procedure works as of September 2017)
1. By default, the server listens on port 3000. You can change this in the config file.

## Running

- `npm run start` - Starts (dumps output to console)
- `npm run background-start` - Starts as a background process (dumps output to nohup.out)

## Usage Notes

This has been tested on Ubuntu 16.04. It should work on other systems, but send me a message if you're getting any errors.

## Known Limitations

- **High latency** - Usually takes about 2-5s for task auto-assignment, but I've had up to 15s. This might be unavoidable - Asana doesn't send a notification as soon as a task is created, but waits a bit to package any subsequent events (lower bandwidth consumption for them, higher latency for us). On the plus side, so long as the server is running, the task will eventually be auto-assigned.

- **New projects/workspaces** - If you create a new project or workspace, you have to restart this script to reinitialize the webhooks. There's no hook that detects a new project, so the script is unaware.