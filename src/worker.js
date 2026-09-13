import { definePlugin } from '@cyrene2008/cyrene-name-roller/plugin-sdk'

// Animation packs and the ambient visual surface run on the host side;
// this process only owns the plugin lifecycle and private settings bridge.
definePlugin({
  async activate(context) {
    this.request = context.request
  },

  async onEvent(event, payload) {
    if (event === 'plugin:storage-changed') return
  },

  async deactivate() {
    this.request = null
  }
})
