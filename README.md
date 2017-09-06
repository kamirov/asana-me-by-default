# Me by Default (for Asana)

Small express app that uses the Asana API to automatically assign tasks you create to yourself.

I admit this was just an excuse to play with express and webhooks.

## TODO

- [ ] Local installation
- [ ] Remote installation
- [ ] Installation instructions

## Known Limitations

- **High latency** - Can take up to 5s for task auto-assignment. This might be unavoidable - Asana doesn't send a notification as soon as a task is created, but waits a bit to package any subsequent events (lower bandwidth consumption for them, higher latency for us).