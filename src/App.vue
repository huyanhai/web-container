<script setup lang="ts">
import { onMounted, ref } from "vue";
import { WebContainerTerminal } from "./utils/webContainer";

onMounted(() => {
  const contaier = new WebContainerTerminal({
    terminalEl: "#terminal",
    editorEl: ".editor",
    iframeEl: ".preview iframe",
  });
});
</script>

<template>
  <div class="container">
    <textarea class="editor"></textarea>
    <div class="preview">
      <iframe frameborder="0"></iframe>
    </div>
  </div>
  <div id="terminal"></div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  border: 0;
}
.container {
  display: flex;
}

.editor {
  width: 50%;
  background: black;
  height: 200px;
  color: white;
}
.preview {
  width: 50%;
  height: 200px;
  border: 1px solid red;
  box-sizing: border-box;
}
.preview iframe {
  width: 100%;
  height: 100%;
}
</style>
