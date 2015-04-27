'use strict';

/* This service is used to offer settings to privileged apps. */
(function (exports) {
  function RadioFMService() {
    this.mozFMRadio = navigator.mozFMRadio;
  }

  RadioFMService.prototype = {
    _observers: [],

    handleRequest: function ss_handleRequest(msg) {
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
        msg.source.postMessage({type: 'get', name: msg.data.name,
          value: this.mozFMRadio[msg.data.name]});
      }
    },

    handleSetMessage: function sw_handleSetMessage(msg) {
      if (!msg.data.name || typeof msg.data.value === 'undefined') {
        console.error('Missing parameter: name');
        return;
      }

      if(this.mozFMRadio[msg.data.name]) {
        this.mozFMRadio[msg.data.name] = msg.data.value;
        msg.source.postMessage({type: 'set', name: msg.data.name,
          value: this.mozFMRadio[msg.data.name] == msg.data.value});
      }
    },

    handleListenerMessage: function sw_handleListenerMessage(msg) {
      if (!msg.data.name) {
        console.error('Missing parameter: name');
        return;
      }

      if(this.mozFMRadio[msg.data.name]) {
        this.mozFMRadio[msg.data.name] = function (value) {
          msg.source.postMessage({type: 'listener', name: msg.data.name,
            value: value});
        };
      }
    },

    handleMessage: function sw_handleMessage(msg) {
      if(this.mozFMRadio[msg.data.type]) {
        msg.source.postMessage({type: 'listener',
          value: this.mozFMRadio[msg.data.type](msg.data.args)});
      }
    },

    respondRequest: function ss_respondRequest(response) {
      navigator.serviceWorker.ready.then(sw => {
        sw.active && sw.active.postMessage(response);
      });
    }
  };

  exports.RadioFMService = new RadioFMService();
}(window));