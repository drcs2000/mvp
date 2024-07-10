<template>
  <v-footer color="tertiary" class="d-flex flex-column pt-10" dark>
    <v-container>
      <v-row justify="space-between" align="center">
        <v-col cols="12" md="4" class="d-flex flex-column">
          <v-img :src="logo" width="60" height="60" />
          <h3 class="white--text mt-2 mb-0">MVP Pitacos</h3>
        </v-col>
        <v-col cols="12" md="4" class="d-flex flex-column justify-center">
          <v-btn text to="/">{{ $t('home') }}</v-btn>
          <v-btn text>{{ $t('live') }}</v-btn>
          <v-btn text>{{ $t('next_games') }}</v-btn>
          <v-btn text>{{ $t('championships') }}</v-btn>
          <v-btn text>{{ $t('my_pools') }}</v-btn>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-end">
          <v-btn icon>
            <v-icon>mdi-instagram</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <div class="text-center my-10">
      {{ $t('all_rights_reserved') }}
    </div>
  </v-footer>
</template>

<script>
import logo from '../assets/images/logo.png'

export default {
  name: "Footer",
  data() {
    return {
      logo
    }
  }
}
</script>
