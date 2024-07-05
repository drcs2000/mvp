<template>
  <v-container fluid fill-height class="pa-0">
    <div class="video-container">
      <video autoplay muted loop id="background-video">
        <source :src="videoSrc" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="content">
      <h1>Seja o <span class="highlight">MVP</span> da Partida!</h1>
      <p>
        Participe dos melhores bolões e mostre que você é o mestre dos palpites!
      </p>
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
  font-size: 4rem;
}

.content p {
  font-size: 1.5rem;
}

.highlight {
  color: #c6de41;
}
</style>
