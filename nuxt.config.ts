// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  app: {
    head: {
      title: 'Eurowings Flight Offers',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content: 'Browse and filter Eurowings flight price offers by origin, destination, and travel dates.',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
  },
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false }
    ]
  },
  vite: {
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/v-calendar')) return 'v-calendar'
            if (id.includes('node_modules/pinia')) return 'pinia'
          },
        },
      },
    },
  },
})
