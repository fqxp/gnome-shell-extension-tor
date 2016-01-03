# Tor GNOME Shell Extension

Switch your "Tor identity" (the tunnel used by future connections) via an onion
button in the GNOME Shell panel.

Currently only supports authentication via auth cookie.

This extension has beta status.

## TODO
[x] Replace "disconnected menu" by single extra menu item
[x] Log extension name so that source is visible in logs
[ ] Make configurable (host/port to use)
[ ] Use async communication with Tor server, making it possible to react to
    signals from the server
[ ] Add other authentication methods

## Ideas
* Add option for switching identity regularly
* Add option for running configurable applications with torsocks (if available)
* Show info about current tunnel (maps, hostnames, countries) - or write
  separate tool?
* Add options for explicitly choosing tunnels, excluding countries etc.
* Support automatic detection of a running Tor Browser?
