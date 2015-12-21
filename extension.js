// ex: set sw=4
/*
Copyright 2015 Frank Ploss <frank@fqxp.de>.

This file is part of gnome-shell-extension-tor.

gnome-shell-extension-tor is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

gnome-shell-extension-tor is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with gnome-shell-extension-tor.  If not, see <http://www.gnu.org/licenses/>./
*/
'use strict';

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Notify = imports.gi.Notify;
const PanelMenu = imports.ui.panelMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const TorControlClient = Me.imports.tor_control_client.TorControlClient;

const TorIcon = 'tor';

let torButton = null;
let torControlClient = null;

const TorButton = new Lang.Class({
    Name: 'TorButton',
    Extends: PanelMenu.Button,

    _init: function(torControlClient) {
        this.parent(null, this.Name);

        this._torControlClient = torControlClient;

        this._icon = new St.Icon({
            icon_name: TorIcon,
            style_class: 'system-status-icon'
        });

        this.actor.add_child(this._icon);

        this.menu.addAction('Switch Tor Identity', Lang.bind(this, function(event) {
            this._switchTorIdentity();
            log('Switched to a new Tor identity!');
        }));
    },

    _switchTorIdentity: function() {
        try {
            this._torControlClient.switchIdentity();
            Main.notify('Switched to a new Tor identity!');
        } catch (e) {
            log(e);
            Main.notifyError('Could not switch Tor identity: ' + e);
        }
    }
});

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
