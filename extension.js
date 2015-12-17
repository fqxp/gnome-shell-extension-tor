'use strict';

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const IndicatorName = "Tor";
const DisabledIcon = 'my-caffeine-off-symbolic';
const EnabledIcon = 'my-caffeine-on-symbolic';
const TorIcon = 'tor';

let torButton;

const TorButton = new Lang.Class({
    Name: IndicatorName,
    Extends: PanelMenu.Button,

    _init: function(metadata, params) {
        this.parent(null, IndicatorName);
        this._icon = new St.Icon({
            icon_name: TorIcon,
            style_class: 'system-status-icon'
        });

        this.actor.add_child(this._icon);
    }
});

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    torButton = new TorButton();
    Main.panel.addToStatusArea(IndicatorName, torButton);
}

function disable() {
    torButton.destroy();
    torButton = null;
}
