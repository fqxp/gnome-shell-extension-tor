// ex: set sw=4
'use strict';

const Gio = imports.gi.Gio;
const Lang = imports.lang;

const TorControlClient = new Lang.Class({
    Name: 'TorControlClient',

    _init: function() {
        this._connect();
        this._updateProtocolInfo();
        this._ensureProtocolCompatibility();
    },

    close: function() {
        this._outputStream.close(null);
        this._inputStream.close(null);
    },

    _connect: function() {
        var socketClient = new Gio.SocketClient();
        var connection = socketClient.connect_to_host('127.0.0.1:9051', null, null);
        this._inputStream = new Gio.DataInputStream({base_stream: connection.get_input_stream()});
        this._outputStream = new Gio.DataOutputStream({base_stream: connection.get_output_stream()});
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
                        authCookieFile = cookieArg[1];
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
    }
});

