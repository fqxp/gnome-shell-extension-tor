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

const Gio = imports.gi.Gio;
const Lang = imports.lang;

const TorControlClient = new Lang.Class({
    Name: 'TorControlClient',

    _init: function() {
        this._connect();
        this._updateProtocolInfo();
        this._ensureProtocolCompatibility();
        this.authenticate();
    },

    close: function() {
        if (this._connection.is_connected()) {
            this._outputStream.close(null);
            this._inputStream.close(null);
        }
    },

    authenticate: function() {
        var cookie = this._readAuthCookie();
        var reply = this._runCommand('AUTHENTICATE ' + cookie);

        if (reply.statusCode != 250) {
            throw 'Could not authenticate, reason: ' + reply.replyLines.join('\n');
        }
    },

    switchIdentity: function() {
        var reply = this._runCommand('SIGNAL NEWNYM');

        if (reply.statusCode != 250) {
            throw 'Could not change Tor identity, reason: ' + reply.replyLines.join('\n');
        }
    },

    _connect: function() {
        var socketClient = new Gio.SocketClient();
        this._connection = socketClient.connect_to_host('127.0.0.1:9051', null, null);
        this._inputStream = new Gio.DataInputStream({base_stream: this._connection.get_input_stream()});
        this._outputStream = new Gio.DataOutputStream({base_stream: this._connection.get_output_stream()});
    },

    _updateProtocolInfo: function() {
        var reply = this._runCommand('PROTOCOLINFO');

        if (reply.statusCode != 250) {
            throw "Could not read protocol info";
        }

        var protocolInfoVersion;
        var authMethods = [];
        var authCookieFile;

        for (let i = 0; i < reply.replyLines.length; i++) {
            let tokens = reply.replyLines[i].split(' ');

            switch (tokens[0]) {
                case 'PROTOCOLINFO':
                    protocolInfoVersion = tokens[1];
                    break;
                case 'AUTH':
                    let methodsArg = tokens[1].split('=');
                    authMethods = methodsArg[1].split(',');

                    if (authMethods.indexOf('COOKIE') != -1 || authMethods.indexOf('SAFECOOKIE') != -1) {
                        let cookieArg = tokens[2].split('=');
                        authCookieFile = cookieArg[1].substr(1, cookieArg[1].length - 2);   // strip quotes
                    }
                    break;
            }
        }

        this._protocolInfo = {
            protocolInfoVersion: protocolInfoVersion,
            authMethods: authMethods,
            authCookieFile: authCookieFile
        }
    },

    _ensureProtocolCompatibility: function() {
        if (this._protocolInfo.protocolInfoVersion != 1) {
            throw 'Cannot handle tor protocol version ' + this._protocolInfo.protocolInfoVersion;
        }
    },

    _runCommand: function(cmd) {
        this._outputStream.put_string(cmd + '\n', null);
        this._outputStream.flush(null);

        var statusCode;
        var replyLines = [];

        do {
            let line = this._readLine();
            var reply = this._parseLine(line);

            statusCode = reply.statusCode;
            replyLines.push(reply.replyLine);
        } while (reply.isMidReplyLine);

        return {
            statusCode: statusCode,
            replyLines: replyLines
        }
    },

    _readLine: function() {
        return this._inputStream.read_line(null, null)[0].toString().trim();
    },

    _parseLine: function(line) {
        return {
            statusCode: parseInt(line.substr(0, 3)),
            isMidReplyLine: (line[3] == '-'),
            replyLine: line.substring(4)
        }
    },

    _readAuthCookie: function() {
        var file = Gio.File.new_for_path(this._protocolInfo.authCookieFile);
        var inputStream = file.read(null);
        var cookieData = inputStream.read_bytes(32, null, null).get_data();
        inputStream.close(null);

        var authCookie = '';
        for (var i = 0; i < cookieData.length; i++) {
            let hexByte = cookieData[i].toString(16);
            if (hexByte.length == 1) {
                hexByte = '0' + hexByte;
            }
            authCookie += hexByte;
        }

        return authCookie;
    }
});

