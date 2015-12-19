// ex: set sw=4
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
        this.actor.connect('button-press-event', Lang.bind(this, function(actor, event) {
            if (event.get_click_count() >= 2) {
                this._switchTorIdentity();
            }
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
