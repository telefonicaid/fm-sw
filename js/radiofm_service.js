'use strict';

/* This service is used to offer settings to privileged apps. */
(function (exports) {
  function RadioFMService() {
    this.mozFMRadio = navigator.mozFMRadio;
  }

  RadioFMService.prototype = {
    _observers: [],

    handleRequest: function ss_handleRequest(msg) {
console.info('MANU - MSG RECEIVED' + JSON.stringify(msg.data));
      switch (msg.data.type) {
        case 'get':
          this.handleGetMessage(msg);
          break;
        case 'set':
          this.handleSetMessage(msg);
          break;
        case 'listener':
          this.handleListenerMessage(msg);
          break;
        case 'execute':
          this.handleExecuteMessage(msg);
          break;
        default:
          this.handleMessage(msg);
          break;
      }
    },

    handleGetMessage: function sw_handleGetMessage(msg) {
      if (!msg.data.name) {
        console.error('Missing parameter: name');
        return;
      }

      if(this.mozFMRadio[msg.data.name]) {
        msg.channel.postMessage({type: 'get', name: msg.data.name,
          value: this.mozFMRadio[msg.data.name]});
      }
    },

    handleSetMessage: function sw_handleSetMessage(msg) {
      if (!msg.data.name || typeof msg.data.value === 'undefined') {
        console.error('Missing parameter: name');
        return;
      }

      var method = 'set' + msg.data.name.charAt(0).toUpperCase() +
        msg.data.name.slice(1);

      if(this.mozFMRadio[method]) {
        this.mozFMRadio[method](msg.data.value);
        msg.channel.postMessage({type: 'set', name: msg.data.name,
          value: this.mozFMRadio[msg.data.name] == msg.data.value});
      }
    },

    handleExecuteMessage: function sw_handleExecuteMessage(msg) {
      if (!msg.data.name) {
        console.error('Missing parameter: name');
        return;
      }

      if(typeof this.mozFMRadio[msg.data.name] === 'function') {
        this.mozFMRadio[msg.data.name]();
        msg.channel.postMessage({type: 'execute', name: msg.data.name,
          value: true});
      }
    },

    handleListenerMessage: function sw_handleListenerMessage(msg) {
      if (!msg.data.name) {
        console.error('Missing parameter: name');
        return;
      }

      if(this.mozFMRadio[msg.data.name]) {
        console.info('Listener added  --> ' + msg.data.name);
        this.mozFMRadio[msg.data.name] = function (value) {
          console.info('Listener triggered  --> ' + msg.data.name);
          msg.channel.postMessage({type: 'listener', name: msg.data.name,
            value: value});
        };
      }
    },

    handleMessage: function sw_handleMessage(msg) {
      if(this.mozFMRadio[msg.data.type]) {
        var req = this.mozFMRadio[msg.data.type](msg.data.args);

        req.onsuccess = function() {
          msg.channel.postMessage({type: msg.data.type, value: true});
        };

        req.onerror = function() {
          msg.channel.postMessage({type: msg.data.type, value: false});
        }
      }
    }
  };

  exports.RadioFMService = new RadioFMService();
}(window));