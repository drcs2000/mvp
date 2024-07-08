<template>
  <v-container fluid fill-height class="pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="6" class="video-container">
        <video autoplay muted loop id="background-video">
          <source :src="videoSrc" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </v-col>
      <v-col cols="12" md="6" class="login-container">
        <v-card class="pa-5" elevation="2">
          <template v-if="isLogin">
            <v-text-field :label="$t('user_email')" prepend-icon="mdi-account" />
            <v-text-field :label="$t('password')" type="password" prepend-icon="mdi-lock" />
            <v-checkbox :label="$t('remember_me')" />
            <v-btn class="mb-4 primary--text" color="secondary" block>{{ $t('login') }}</v-btn>
            <v-btn text block>{{ $t('lost_password') }}</v-btn>
            <v-btn text block @click="toggleForm">{{ $t('to_register') }}</v-btn>
          </template>
          <template v-else>
            <v-text-field v-model="firstName" :label="$t('first_name')" prepend-icon="mdi-account" />
            <v-text-field v-model="lastName" :label="$t('last_name')" prepend-icon="mdi-account" />
            <v-text-field v-model="email" :label="$t('user_email')" prepend-icon="mdi-email" />
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
            <v-btn class="mb-4 primary--text" color="secondary" block @click="register">{{ $t('register') }}</v-btn>
            <v-btn text block @click="toggleForm">{{ $t('back_to_login') }}</v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import videoSrc from "../assets/videos/login.mp4"

export default {
  name: "Login",
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

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px - 48px);
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left;
  opacity: 0.8;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #C6DE41;
  z-index: 1;
}

.v-card {
  width: 100%;
  max-width: 400px;
}

@media (max-width: 960px) {
  .video-container {
    height: 50vh;
  }

  .login-container {
    height: 50vh;
  }

  #background-video {
    height: 50vh;
  }
}
</style>
