<script setup lang="ts">
import { onMounted, ref, shallowRef } from "vue";
import { WebContainerTerminal } from "./utils/webContainer";

onMounted(async () => {
  // const contaier = new WebContainerTerminal({
  //   terminalEl: "#terminal",
  //   editorEl: ".editor",
  //   iframeEl: ".preview iframe",
  // });
});

const arr = ref<any>([]);

const loopDirectory = async (directorys: any, dirName: string = "") => {
  for await (const item of directorys.values()) {
    if (item.kind === "directory") {
      !["node_modules", ".git", ".vscode"].includes(item.name) && loopDirectory(item, item.name);
    } else {
      arr.value.push({
        path: `${dirName ? `${dirName}/` : ""}${item.name}`,
        name: item.name,
        file: item,
      });
    }
  }
  console.log(arr.value);
};

const open = async () => {
  const directorys = await window.showDirectoryPicker();
  loopDirectory(directorys);
};

const setInfo = async (file: any) => {
  let fileBuffer = await file.getFile();
  let reader = new FileReader();

  reader.readAsText(fileBuffer);

  reader.onload = (data) => {
    (document.querySelector(".editor") as HTMLTextAreaElement).value = data.target?.result as string;
  };
};
</script>

<template>
  <div>
    <div v-for="item in arr" :key="item" @click="setInfo(item.file)">{{ item.name }}</div>
  </div>
  <div class="container">
    <textarea class="editor"></textarea>
    <div class="preview">
      <iframe frameborder="0"></iframe>
    </div>
  </div>
  <button @click="open">打开目录</button>
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
