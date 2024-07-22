<template>
  <v-container fluid fill-height class="pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="6" class="relative w-full h-full video-container">
        <video autoplay muted loop id="background-login-video">
          <source :src="videoSrc" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </v-col>
      <v-col cols="12" md="6" class="login-container">
        <v-card class="pa-5" elevation="2">
          <transition name="fade" mode="out-in">
            <div v-if="isLogin" key="login">
              <v-card-title>{{ $t('login_title') }}</v-card-title>
              <v-divider />
              <v-card-text class="my-3" style="overflow-y: auto; max-height: 40vh;">
                <v-text-field :label="$t('user_email')" prepend-icon="mdi-account" />
                <v-text-field :label="$t('password')" type="password" prepend-icon="mdi-lock" />
                <v-checkbox :label="$t('remember_me')" />
              </v-card-text>
              <v-divider />
              <v-card-actions class="d-flex flex-column actions">
                <v-btn class="mt-3 primary--text" color="secondary" block>{{ $t('login') }}</v-btn>
                <v-btn class="mt-3" text block>{{ $t('lost_password') }}</v-btn>
                <v-btn class="mt-3" text block @click="toggleForm">{{ $t('to_register') }}</v-btn>
              </v-card-actions>
            </div>
            <div v-else key="register">
              <v-card-title>{{ $t('register_title') }}</v-card-title>
              <v-divider />
              <v-card-text class="my-3" style="overflow-y: auto; max-height: 40vh;">
                <v-text-field v-model="firstName" :label="$t('first_name')" prepend-icon="mdi-account" />
                <v-text-field v-model="lastName" :label="$t('last_name')" prepend-icon="mdi-account" />
                <v-text-field v-model="email" :label="$t('email')" prepend-icon="mdi-email" />
                <v-text-field v-model="username" :label="$t('username')" prepend-icon="mdi-account" />
                <v-text-field
                  v-model="password"
                  :label="$t('password')"
                  type="password"
                  prepend-icon="mdi-lock"
                  :rules="[passwordRule]"
                />
                <v-text-field
                  v-model="confirmPassword"
                  :label="$t('confirm_password')"
                  type="password"
                  prepend-icon="mdi-lock"
                  :rules="[confirmPasswordRule]"
                />
              </v-card-text>
              <v-divider />
              <v-card-actions class="d-flex flex-column actions">
                <v-btn class="mt-3 primary--text" color="secondary" block @click="register">{{ $t('register') }}</v-btn>
                <v-btn class="mt-3" block text @click="toggleForm">{{ $t('to_login') }}</v-btn>
              </v-card-actions>
            </div>
          </transition>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import videoSrc from "../assets/videos/login.mp4"

export default {
  name: "Login",
  layout: 'login',
  head() {
    return{
      title: 'Login'
    }
  },
  data() {
    return {
      videoSrc,
      isLogin: true,
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
  },
  methods: {
    toggleForm() {
      this.isLogin = !this.isLogin;
    },
    register() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }
  },
  computed: {
    passwordRule() {
      return (value) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(value) || "Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";
      };
    },
    confirmPasswordRule() {
      return (value) => {
        return value === this.password || "Passwords do not match";
      };
    }
  }
};
</script>
