<template>
  <v-app-bar app color="primary" dark>
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-img src="@/assets/logo.png" contain width="50" height="50"></v-img>
        </v-col>

        <v-col cols="auto" class="text-center">
          <v-btn text>
            <v-icon color="red">mdi-circle</v-icon>
            Ao vivo
          </v-btn>
          <v-btn text>Campeonatos</v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn outlined color="secondary">Logar</v-btn>
          <v-btn color="secondary">
            Registrar
            <v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
export default {
  name: "NavBar",
};
</script>

<style scoped>
.v-app-bar {
  background-color: #21475b !important; /* Ajuste a cor conforme necessário */
}
.text-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
