<template>
  <v-container fluid fill-height class="pa-0">
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
    <div class="live-games">
      <h2>{{ $t("live") }}</h2>
      <div class="game">
        <span class="team">Fluminense</span>
        <span class="score">1</span>
        <span class="minute">79'</span>
        <span class="score">1</span>
        <span class="team">Internacional</span>
      </div>
      <div class="pagination">
        <span class="dot" :class="{ active: true }"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
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
  width: 100vw;
  height: auto;
  object-fit: cover;
  opacity: 0.8; /* Increased opacity */
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  z-index: 1;
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

.live-games {
  background-color: #153b44;
  color: white;
  padding: 20px;
  text-align: center;
  width: 100%;
}

.live-games h2 {
  margin-bottom: 20px;
}

.game {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.game .team {
  font-size: 1.2rem;
  margin: 0 10px;
}

.game .score {
  font-size: 2rem;
  margin: 0 10px;
}

.game .minute {
  font-size: 1rem;
  color: #c6de41;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.dot {
  height: 10px;
  width: 10px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  margin: 0 5px;
}

.dot.active {
  background-color: #c6de41;
}
</style>
