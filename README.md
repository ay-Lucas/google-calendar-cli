# Google Calendar CLI Tool - Node JS

Integrates google calendar into your command line and keeps things simple.

1. Create a Google project - [Create a project](https://console.cloud.google.com/)
2. Go to Credentials
3. Create OAuth client ID - choose Desktop Application type and download the JSON file
4. Move the JSON file to the root of the project
5. Type `gcal setup` to login to Google via OAuth 2.0

And you're done

## Events

-   Add events with `gcal add <title> [calendarName] -s <mm/dd hh:mm> -e <mm/dd hh:mm>`
-   Add events from specific calendars with `gcal add <calendarName>`

-   List events from a specific calendar with `gcal list <calendarName>`
    -   Use `-n [number]` flag to indicate the number of events to list

## Calendars

-   List calendar names with `gcal list calendars` or `gcal list -c`
-   List calendar metadata objects with `gcal list calendars` or `gcal list -C`

## Help

-   Use `list --help` or `add --help` to view arguments and options
