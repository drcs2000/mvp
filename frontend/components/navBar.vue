<template>
  <v-app-bar app color="secondary" dark>
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-img src="../assets/images/logo.png" contain width="50" height="50" />
        </v-col>

        <v-col class="d-flex justify-center">
          <v-btn text>Ao vivo</v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on">Campeonatos</v-btn>
            </template>
            <v-list>
              <v-list-item link>
                <v-list-item-title>Campeonato 1</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>Campeonato 2</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>Campeonato 3</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>

        <v-col cols="auto">
          <v-btn outlined color="primary">Logar</v-btn>
          <v-btn color="primary">
            <span>Registrar</span>
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
export default {
  name: "navBar"
}
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}
</style>
