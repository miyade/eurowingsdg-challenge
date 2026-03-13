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
})
