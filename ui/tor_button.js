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
const PopupMenu = imports.ui.popupMenu;
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

        var menu = new TorPopupMenu(this.actor, this._torControlClient, 'disconnected');
        this.setMenu(menu);
    },

    _bindEvents: function() {
        this._torControlClient.connect('changed-connection-state', Lang.bind(this, this._onChangedConnectionState));
        this._torControlClient.connect('switched-tor-identity', Lang.bind(this, this._onSwitchedTorIdentity));
        this._torControlClient.connect('protocol-error', Lang.bind(this, this._onProtocolError));
    },

    _onChangedConnectionState: function(source, state, reason) {
        switch (state) {
            case 'ready':
                this._icon.icon_name = TorConnectedIcon;
                this.menu.setState('connected');
                break;
            case 'closed':
                this._icon.icon_name = TorDisconnectedIcon;
                this.menu.setState('disconnected', reason);
                break;
        }
    },

    _onSwitchedTorIdentity: function() {
        Main.notify('Switched to a new Tor identity!');
    },

    _onProtocolError: function(source, message, statusCode) {
        var msg = 'Tor control protocol error: ' + message + ' (status code' + statusCode + ')';
        Main.notifyError(msg);
    }
});
