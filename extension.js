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

const Main = imports.ui.main;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const TorButton = Me.imports.ui.tor_button.TorButton;
const TorControlClient = Me.imports.tor_control_client.TorControlClient;

let torButton = null;
let torControlClient = null;

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    try {
        torControlClient = new TorControlClient();
        torButton = new TorButton(torControlClient);
        Main.panel.addToStatusArea(torButton.Name, torButton);
    } catch (e) {
        log(e);
        Main.notifyError('Error starting extension: ' + e);
        disable();
    }
}

function disable() {
    if (torButton !== null) {
        torButton.destroy();
        torButton = null;
    }
    if (torControlClient !== null) {
        torControlClient.close();
        torControlClient = null;
    }
}
