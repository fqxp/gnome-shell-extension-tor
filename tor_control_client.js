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
const Signals = imports.signals;

const TorConnectionError = new Lang.Class({
    Name: 'TorConnectionError',

    _init: function(message) {
        this.message = message;
    }
})

const TorProtocolError = new Lang.Class({
    Name: 'TorProtocolError',

    _init: function(message, statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }
});

const TorControlClient = new Lang.Class({
    Name: 'TorControlClient',


    _init: function(host, port) {
        this._host = host;
        this._port = port;
        this._fail_reason = null;
    },

    openConnection: function() {
        try {
            this._connect(this._host, this._port);
            this._updateProtocolInfo();
            this._ensureProtocolCompatibility();
            this._authenticate();
            this.emit('changed-connection-state', 'ready');
        } catch (e if e instanceof TorConnectionError) {
            this.closeConnection(e.message);
        } catch (e if e instanceof TorProtocolError) {
            //this.emit('protocol-error', 'Error while connecting to Tor control port', e.message);
            this.closeConnection(e.message);
        }
    },

    closeConnection: function(reason) {
        if (this._connection && this._connection.is_connected()) {
            this._connection.close(null);
        }

        this._connection = null;

        this.emit('changed-connection-state', 'closed', reason);
    },

    switchIdentity: function() {
        var reply = this._runCommand('SIGNAL NEWNYM');

        if (reply.statusCode == 250) {
            this.emit('switched-tor-identity');
        } else {
            this.emit(
                'protocol-error',
                'Could not switch Tor identity: ' + reply.replyLines.join('\n'),
                reply.statusCode
            );
        }
    },

    _connect: function(host, port) {
        var socketClient = new Gio.SocketClient();

        try {
            this._connection = socketClient.connect_to_host(host + ':' + port, null, null);
        } catch (e if e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CONNECTION_REFUSED)) {
            throw new TorConnectionError(
                    'Could not connect to Tor control port (Tor is not listening on ' + host + ':' + port + ')');
        }

        this._inputStream = new Gio.DataInputStream({base_stream: this._connection.get_input_stream()});
        this._outputStream = new Gio.DataOutputStream({base_stream: this._connection.get_output_stream()});
    },

    _updateProtocolInfo: function() {
        var reply = this._runCommand('PROTOCOLINFO');

        if (reply.statusCode != 250) {
            throw new TorProtocolError(
                    'Could not read protocol info, reason: ' + reply.replyLines.join('\n'),
                    reply.statusCode);
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
            throw new TorProtocolError('Cannot handle tor protocol version ' + this._protocolInfo.protocolInfoVersion);
        }
    },

    _authenticate: function() {
        var cookie = this._readAuthCookie();
        var reply = this._runCommand('AUTHENTICATE ' + cookie);

        if (reply.statusCode != 250) {
            throw new TorProtocolError(
                'Could not authenticate, reason: ' + reply.replyLines.join('\n'),
                statusCode
            );
        }
    },

    _runCommand: function(cmd) {
        this._outputStream.put_string(cmd + '\n', null);
        this._outputStream.flush(null);

        var statusCode;
        var replyLines = [];

        do {
            let line = this._readLine();

            if (line === null) {
                let reason = 'Lost connection to Tor server';
                this.closeConnection(reason);
                return {replyLines: [reason]};
            }

            var reply = this._parseLine(line);
            statusCode = reply.statusCode;
            replyLines.push(reply.replyLine);
        } while (reply.isMidReplyLine);

        return {
            statusCode: statusCode,
            replyLines: replyLines
        };
    },

    _readLine: function() {
        [line, length] = this._inputStream.read_line(null, null);

        return (line !== null) ? line.toString().trim() : null;
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

Signals.addSignalMethods(TorControlClient.prototype);
