<template>
  <v-container class="mt-5">
    <v-col cols="12" class="max-width-container">
      <v-stepper v-model="step">
        <v-stepper-header>
          <v-stepper-step :complete="step > 1" step="1"
            >Informações Básicas</v-stepper-step
          >
          <v-divider />
          <v-stepper-step :complete="step > 2" step="2"
            >Campeonatos</v-stepper-step
          >
          <v-divider />
          <v-stepper-step :complete="step > 3" step="3">Regras</v-stepper-step>
          <v-divider />
          <v-stepper-step :complete="step > 4" step="4"
            >Participantes</v-stepper-step
          >
        </v-stepper-header>

        <v-window v-model="step">
          <v-window-item :value="1">
            <v-card-text>
              <v-col cols="12">
                <v-row align="center">
                  <v-col cols="12" md="8">
                    <v-text-field
                      label="Nome do Bolão"
                      outlined
                      hide-details
                    />
                    <div class="caption px-3 pt-3">
                      Dê um nome ao bolão que você deseja criar.<span
                        class="font-weight-bold"
                      >
                        - Obrigatório</span
                      >
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-currency="{
                        locale: 'pt-BR',
                        currency: 'BRL',
                        valueAsInteger: true,
                        precision: 2,
                        autoDecimalMode: true,
                        allowNegative: false,
                        exportValueAsInteger: true,
                      }"
                      label="Valor"
                      outlined
                      hide-details
                    />
                    <div class="caption px-3 pt-3">
                      Estipule um valor de entrada.<span
                        class="font-weight-bold"
                      >
                        - Obrigatório</span
                      >
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <span class="mr-5">O Bolão terá início em</span>
                    <v-menu
                      transition="scale-transition"
                      offset-y
                      :close-on-content-click="false"
                    >
                      <template #activator="{ on }">
                        <v-btn outlined v-on="on">
                          {{ statementDateFormat(statementStart) }}
                        </v-btn>
                      </template>
                      <v-date-picker
                        class="date-picker"
                        v-model="statementStart"
                      />
                    </v-menu>
                    <span class="mx-5">e fim em</span>
                    <v-menu transition="scale-transition" offset-y>
                      <template #activator="{ on }">
                        <v-btn outlined v-on="on">
                          {{ statementDateFormat(statementEnd) }}
                        </v-btn>
                      </template>
                      <v-date-picker class="date-picker" v-model="statementEnd" />
                    </v-menu>
                  </v-col>
                </v-row>
              </v-col>
            </v-card-text>
          </v-window-item>

          <v-window-item :value="2">
            <v-card-text> Davi Rangel Câmara da Silva </v-card-text>
          </v-window-item>

          <v-window-item :value="3"> </v-window-item>

          <v-window-item :value="4"> </v-window-item>
        </v-window>

        <v-divider />

        <v-card-actions>
          <v-btn text @click="step--" :disabled="step === 1">Voltar</v-btn>
          <v-spacer />
          <v-btn text @click="step++">Próximo</v-btn>
        </v-card-actions>
      </v-stepper>
    </v-col>
  </v-container>
</template>

<script>
const numberFormatCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormat = new Intl.DateTimeFormat("pt-BR");

const dateStart = new Date();
dateStart.setHours(0, 0, 0, 0);

const dateEnd = new Date();
dateEnd.setDate(dateEnd.getDate() + 1);
dateEnd.setHours(23, 59, 59, 59);
const statementStart = dateFormat
  .format(dateStart)
  .split("/")
  .reverse()
  .join("-");
const statementEnd = dateFormat.format(dateEnd).split("/").reverse().join("-");

const statementDateFormat = (value) => {
  const date = new Date(value);

  date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

export default {
  name: "NewPool",
  head() {
    return {
      title: "New Pool",
    };
  },
  data: () => ({
    step: 1,
    statementStart,
    statementEnd,
    statementDateFormat,
  }),
  methods: {
    createBolao() {
      // Lógica para criar o bolão
      alert("Bolão criado com sucesso!");
    },
  },
};
</script>

<style scoped>
.max-width-container {
  max-width: 1280px;
  margin: 0 auto;
}

.date-picker {
  max-width: 290px;
}

.v-date-picker-table {
  width: 100% !important;
}

.v-date-picker-header,
.v-date-picker-title {
  padding-left: 0;
  padding-right: 0;
}
</style>
