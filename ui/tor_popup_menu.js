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
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const TorPopupMenu = new Lang.Class({
    Name: 'TorPopupMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function(actor, torControlClient) {
        this._torControlClient = torControlClient;
        this.parent(actor, 0.25, St.Side.TOP);

        this._addActions();
    },

    _addActions: function() {
        this.addAction('Switch Tor Identity', Lang.bind(this, this._switchTorIdentity));
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
