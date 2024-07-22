<template>
  <v-container fluid fill-height class="pa-0">
    <v-row no-gutters class="relative w-full h-screen">
      <v-col cols="12" class="relative w-full h-full">
        <video autoplay muted loop id="background-video">
          <source :src="videoSrc" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div class="content">
          <h1>
            {{ $t("welcome-title-part1") }}
            <span class="highlight">{{ $t("welcome-title-part2") }}</span>
            {{ $t("welcome-title-part3") }}
          </h1>
          <p>{{ $t("welcome-message") }}</p>
        </div>
      </v-col>
    </v-row>

    <v-row no-gutters class="w-full">
      <v-col cols="12" class="p-0">
        <div class="live-indicator pt-8">
          <h2>{{ $t("live") }}</h2>
        </div>
        <v-carousel cycle hide-delimiter-background height="350px">
          <v-carousel-item v-for="(game, index) in games" :key="`game-${index}`" class="carousel-item">
            <v-sheet color="#153b44" height="100%" class="d-flex align-center justify-center">
              <div class="white--text text-center">
                <div class="d-flex justify-center align-center">
                  <div class="team-container">
                    <img :src="game.homeLogo" alt="Home Team Logo" class="team-logo" />
                    <span>{{ game.homeTeam }}</span>
                  </div>
                  <h1 class="score">{{ game.homeScore }}</h1>
                  <span class="minute">{{ game.minute }}</span>
                  <h1 class="score">{{ game.awayScore }}</h1>
                  <div class="team-container">
                    <img :src="game.awayLogo" alt="Away Team Logo" class="team-logo" />
                    <span>{{ game.awayTeam }}</span>
                  </div>
                </div>
              </div>
            </v-sheet>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </v-row>

    <v-row no-gutters class="w-full text-center">
      <v-col cols="12" class="p-4 max-width-container">
        <h2 style="font-size: 3.5rem; color: white" class="my-10">
          {{ $t('prediction') }}
        </h2>
        <v-carousel cycle hide-delimiter-background>
          <v-carousel-item v-for="(gameChunk, index) in chunkedNextGames" :key="`next-game-${index}`">
            <v-row>
              <v-col cols="12" md="6" v-for="(game, gameIndex) in gameChunk" :key="`next-game-chunk-${gameIndex}`">
                <v-card class="mx-auto" color="#153B44" dark>
                  <v-card-title class="justify-center">{{ game.date }}</v-card-title>
                  <v-card-subtitle class="white--text text-center">{{ game.league }}</v-card-subtitle>
                  <v-card-text class="white--text text-center">
                    <div class="d-flex justify-center align-center">
                      <img :src="game.homeLogo" alt="Home Team Logo" class="team-logo-small" />
                      <span class="mx-2">X</span>
                      <img :src="game.awayLogo" alt="Away Team Logo" class="team-logo-small" />
                    </div>
                    <div class="d-flex justify-center align-center my-2">
                      <span>{{ game.homeTeam }}</span>
                      <span class="mx-2">vs</span>
                      <span>{{ game.awayTeam }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </v-row>

    <v-row no-gutters class="w-full text-center mb-10">
      <v-col cols="12" class="max-width-container">
        <h2 style="font-size: 3.5rem; color: white" class="my-10">{{ $t("championships") }}</h2>
        <v-sheet class="mx-auto" style="background-color: transparent;" dark>
          <v-slide-group v-model="model" class="pa-4" center-active show-arrows>
            <v-slide-item v-for="(trophy, index) in trophies" :key="`trophy-${index}`" v-slot="{ isSelected, toggle }">
              <v-card :color="isSelected ? 'primary' : 'grey-lighten-1'" class="ma-4" @click="toggle">
                <v-img :src="trophy.image" max-height="450px" height="auto" width="auto" />
              </v-card>
            </v-slide-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import videoSrc from "../assets/videos/video.mp4"
import fluminenseLogo from "../assets/images/teamHome.png"
import internacionalLogo from "../assets/images/teamAway.png"
import trophy from "../assets/images/trophy.png"

export default {
  name: "Home",
  head() {
    return {
      title: 'Home'
    }
  },
  data() {
    return {
      videoSrc,
      model: null,
      games: [
        {
          homeTeam: "Fluminense",
          homeScore: 1,
          awayTeam: "Internacional",
          awayScore: 1,
          minute: "79'",
          homeLogo: fluminenseLogo,
          awayLogo: internacionalLogo,
        },
        {
          homeTeam: "Fluminense",
          homeScore: 1,
          awayTeam: "Internacional",
          awayScore: 1,
          minute: "79'",
          homeLogo: fluminenseLogo,
          awayLogo: internacionalLogo,
        },
        {
          homeTeam: "Fluminense",
          homeScore: 1,
          awayTeam: "Internacional",
          awayScore: 1,
          minute: "79'",
          homeLogo: fluminenseLogo,
          awayLogo: internacionalLogo,
        },
      ],
      nextGames: [
        {
          date: "11/08",
          league: "Brasileirão",
          homeTeam: "Fluminense",
          homeLogo: fluminenseLogo,
          awayTeam: "Internacional",
          awayLogo: internacionalLogo,
        },
        {
          date: "11/08",
          league: "Brasileirão",
          homeTeam: "Fluminense",
          homeLogo: fluminenseLogo,
          awayTeam: "Internacional",
          awayLogo: internacionalLogo,
        },
        {
          date: "11/08",
          league: "Brasileirão",
          homeTeam: "Fluminense",
          homeLogo: fluminenseLogo,
          awayTeam: "Internacional",
          awayLogo: internacionalLogo,
        },
        {
          date: "11/08",
          league: "Brasileirão",
          homeTeam: "Fluminense",
          homeLogo: fluminenseLogo,
          awayTeam: "Internacional",
          awayLogo: internacionalLogo,
        },
      ],
      trophies: [
        { title: "UEFA Champions League", image: trophy },
        { title: "Copa América", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy },
        { title: "Copa do Brasil", image: trophy }
      ]
    };
  },
  computed: {
    chunkedNextGames() {
      const chunkSize = 4;
      const chunks = [];
      for (let i = 0; i < this.nextGames.length; i += chunkSize) {
        chunks.push(this.nextGames.slice(i, i + chunkSize));
      }
      return chunks;
    },
  },
};
</script>

<style scoped>
.relative {
  position: relative;
}

.max-width-container {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
