# Tor GNOME Shell Extension

Switch your "Tor identity" (the tunnel used by future connections) by
double-clicking the Tor icon in the GNOME Shell panel.

Currently only supports authentication via auth cookie.

Suppose beta status.

## TODO
* Add other authentication methods
* Make configurable (host/port to use)
* Use async communication with Tor server, making it possible to react to
  signals from the server

## Ideas
* Add option for switching identity regularly
* Add option for running configurable applications with torsocks (if available)
* Show info about current tunnel (maps, hostnames, countries)
* Add option for explicitly choosing tunnels, excluding countries etc.
