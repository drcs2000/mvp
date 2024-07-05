<template>
  <v-container fluid fill-height class="pa-0">
    <div class="video-container">
      <video autoplay muted loop id="background-video">
        <source :src="videoSrc" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="content">
      <h1>
        {{ $t("welcome-title-part1") }}
        <span class="highlight">{{ $t("welcome-title-part2") }}</span>
        {{ $t("welcome-title-part3") }}
      </h1>
      <p>{{ $t("welcome-message") }}</p>
    </div>
  </v-container>
</template>

<script>
import videoSrc from "../assets/videos/video.mp4";

export default {
  name: "Home",
  data() {
    return {
      videoSrc,
    };
  },
};
</script>

<style scoped>
.video-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
}

.content h1 {
  font-size: 3.5rem;
}

.content p {
  font-size: 1.5rem;
}

.highlight {
  color: #c6de41;
}
</style>
