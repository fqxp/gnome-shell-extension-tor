// vim: set sw=4:ts=4
/*
Copyright 2015, 2016 Frank Ploss <frank@fqxp.de>.

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
along with gnome-shell-extension-tor.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const TorPopupMenu = new Lang.Class({
    Name: 'TorPopupMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function(actor, torControlClient, state) {
        this._torControlClient = torControlClient;
        this.parent(actor, 0.25, St.Side.TOP);

        this._addActions();
        this.setState(state);
    },

    setState: function(state, reason) {
        switch (state) {
            case 'connected':
                this._switchTorIdentityMenuItem.setSensitive(true);
                this._setMessage(null);
                break;
            case 'disconnected':
                this._switchTorIdentityMenuItem.setSensitive(false);
                this._setMessage(reason);
                break;
        }
    },

    _addActions: function() {
        this._switchTorIdentityMenuItem =
            this.addAction('Switch Tor Identity', Lang.bind(this, this._switchTorIdentity));
    },

    _setMessage: function(message) {
        if (!message) {
            this._removeMessageMenuItem();
            return;
        }

        if (!this._messageMenuItem) {
            this._addMessageMenuItem();
        }

        this._messageLabel.set_text('No connection. ' + message);
    },

    _addMessageMenuItem: function() {
        this._messageMenuItem = new PopupMenu.PopupBaseMenuItem({reactive: false});
        this._messageMenuItem.setSensitive(false);
        this._messageLabel = new St.Label();
        this._messageMenuItem.actor.add_actor(this._messageLabel);
        this.addMenuItem(this._messageMenuItem, 0);
    },

    _removeMessageMenuItem: function() {
        if (!this._messageMenuItem)
            return;

        this._messageMenuItem.destroy();
        this._messageMenuItem = null;
    },

    _switchTorIdentity: function() {
        this._torControlClient.switchIdentity();
    }
});
