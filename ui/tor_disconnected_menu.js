// vim: set sw=4:ts=4
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
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const TorDisconnectedMenu = new Lang.Class({
    Name: 'TorDisconnectedMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function(actor, torControlClient, reason) {
        this._torControlClient = torControlClient;
        this.parent(actor, 0.25, St.Side.TOP);

        this._addActions();
        this.setReason(reason);
    },

    destroy: function() {
        this.parent(arguments);
    },

    setReason: function(reason) {
        this._msgLabel.set_text('No connection. ' + reason);
    },

    _addActions: function() {
        var errorMessageMenuItem = new PopupMenu.PopupBaseMenuItem({reactive: false});
        errorMessageMenuItem.setSensitive(false);
        this._msgLabel = new St.Label();
        errorMessageMenuItem.actor.add_actor(this._msgLabel);
        this.addMenuItem(errorMessageMenuItem);

        this.addAction('Reconnect', Lang.bind(this, this._reconnect));
    },

    _reconnect: function() {
        this._torControlClient.openConnection();
    }
});
