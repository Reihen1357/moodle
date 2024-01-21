<template>
	<input type="file" id="inputFile" />
	<button id="button">Send</button>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(() => {
	var input = document.getElementById("inputFile");
	var button = document.getElementById("button");

	var readFile = (data) =>
		new Promise((resolve, reject) => {
			const fileReader = new FileReader();

			fileReader.addEventListener("loadend", (event) =>
				resolve(event.target.result)
			);
			fileReader.addEventListener("error", (event) =>
				reject(event.target?.error)
			);

			fileReader.readAsArrayBuffer(data);
		});

	var toByteArray = (file) =>
		readFile(file).then((buffer) => Array.from(new Uint8Array(buffer)));

	var apiUrl = "http://localhost:4444/api/file/save";

	button.addEventListener("click", () => {
		var file = input.files[0];
		toByteArray(file).then((content) =>
			fetch(apiUrl, {
				method: "POST",
				body: JSON.stringify({
					file: { content, name: file.name },
				}),
				headers: { "Content-Type": "application/json" },
			})
				.then((r) => r.json())
				.then(console.log)
				.catch(alert)
		);
	});
});
</script>
