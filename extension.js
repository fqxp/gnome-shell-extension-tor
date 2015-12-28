// ex: set sw=4:ts=4
/*
Copyright 2015 Frank Ploss <frank@fqxp.de>.

This file is part of gnome-shell-extension-tor.

gnome-shell-extension-tor is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

gnome-shell-extension-tor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with gnome-shell-extension-tor.  If not, see <http://www.gnu.org/licenses/>./
*/
'use strict';

const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const TorButton = Me.imports.ui.tor_button.TorButton;
const TorControlClient = Me.imports.tor_control_client.TorControlClient;

const TOR_CONTROL_HOST = '127.0.0.1';
const TOR_CONTROL_PORT = 9051;

let torButton = null;
let torControlClient = null;

function init(extensionMeta) {
    let theme = Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    torControlClient = new TorControlClient(TOR_CONTROL_HOST, TOR_CONTROL_PORT, true);
    torButton = new TorButton(torControlClient);
    Main.panel.addToStatusArea(torButton.Name, torButton);
    torControlClient.openConnection();
}

function disable() {
    if (torControlClient !== null)
        torControlClient.destroy();

    if (torButton !== null)
        torButton.destroy();
}
