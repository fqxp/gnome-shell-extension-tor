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

const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const TorPopupMenu = Me.imports.ui.tor_popup_menu.TorPopupMenu;

const TorConnectedIcon = 'tor-connected';
const TorDisconnectedIcon = 'tor-disconnected';

const TorButton = new Lang.Class({
    Name: 'TorButton',
    Extends: PanelMenu.Button,

    _init: function(torControlClient) {
        this.parent(null, this.Name);

        this._torControlClient = torControlClient;

        this._buildUi();
        this._bindEvents();
    },

    _buildUi: function() {
        this._icon = new St.Icon({
            icon_name: TorDisconnectedIcon,
            style_class: 'system-status-icon'
        });

        this.actor.add_child(this._icon);

        this._menu = new TorPopupMenu(this.actor, this._torControlClient);
        this.setMenu(this._menu);
    },

    _bindEvents: function() {
        this._torControlClient.connect('changed-connection-state', Lang.bind(this, this._changedConnectionState));
    },

    _changedConnectionState: function(source, state) {
        log('NEW STATE: ' + state);
        switch (state) {
            case 'connected':
                this._icon.icon_name = TorConnectedIcon;
                break;
            case 'disconnected':
                this._icon.icon_name = TorDisconnectedIcon;
                break;
        }
    }
});
