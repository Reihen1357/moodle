const readFile = (data) =>
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

export const toByteArray = (file) =>
	readFile(file).then((buffer) => Array.from(new Uint8Array(buffer)));
